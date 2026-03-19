#!/usr/bin/env node
/**
 * BrightData MCP Server — Kupuri Media™ / SYNTHIA™
 *
 * Exposes BrightData's web scraping & proxy capabilities as MCP tools.
 * All tools route through the BrightData Scraping Browser or Proxy API.
 *
 * Required env vars:
 *   BRIGHTDATA_API_TOKEN  — BrightData API token (from master.env)
 *   BRIGHTDATA_ZONE       — Proxy zone name (default: residential_proxy)
 *
 * Tools exposed:
 *   brightdata_scrape      — Scrape a URL using BrightData's Scraping Browser
 *   brightdata_search      — Search the web via BrightData SERP API
 *   brightdata_dataset     — Fetch a BrightData dataset snapshot
 *   brightdata_proxy_fetch — Raw HTTP fetch through BrightData residential proxy
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import https from "node:https";

const BRIGHTDATA_API_TOKEN = process.env.BRIGHTDATA_API_TOKEN;
const BRIGHTDATA_ZONE = process.env.BRIGHTDATA_ZONE ?? "residential_proxy";
const BRIGHTDATA_API_BASE = "https://api.brightdata.com";

if (!BRIGHTDATA_API_TOKEN) {
  console.error("[mcp-brightdata] BRIGHTDATA_API_TOKEN is not set. Server will start but calls will fail.");
}

// ---------------------------------------------------------------------------
// Helper: simple HTTPS request
// ---------------------------------------------------------------------------

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on("data", (d) => chunks.push(d));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve({ status: res.statusCode, body: text, headers: res.headers });
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// ---------------------------------------------------------------------------
// Tool: brightdata_scrape
// ---------------------------------------------------------------------------

async function brightdataScrape({ url, waitFor, javascript }) {
  if (!url) throw new Error("url is required");

  // Use BrightData Scraping Browser via their Puppeteer/CDP API endpoint
  // Simplified: use BrightData's direct scrape endpoint
  const payload = JSON.stringify({
    url,
    country: "mx",  // LATAM-focused
    ...(waitFor ? { wait_for: waitFor } : {}),
    ...(javascript ? { render_js: true } : {}),
  });

  const { url: reqUrl } = new URL(`${BRIGHTDATA_API_BASE}/scrape`);
  const result = await httpsRequest({
    hostname: "api.brightdata.com",
    path: "/scrape",
    method: "POST",
    headers: {
      "Authorization": `Bearer ${BRIGHTDATA_API_TOKEN}`,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(payload),
    },
  }, payload);

  if (result.status !== 200) {
    return { error: `BrightData API error ${result.status}`, body: result.body };
  }

  return { url, content: result.body, method: "brightdata_scraping_browser" };
}

// ---------------------------------------------------------------------------
// Tool: brightdata_search
// ---------------------------------------------------------------------------

async function brightdataSearch({ query, country, count }) {
  if (!query) throw new Error("query is required");

  const params = new URLSearchParams({
    q: query,
    country: country ?? "mx",
    num: String(count ?? 10),
  });

  const result = await httpsRequest({
    hostname: "api.brightdata.com",
    path: `/serp?${params.toString()}`,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${BRIGHTDATA_API_TOKEN}`,
    },
  });

  if (result.status !== 200) {
    return { error: `BrightData SERP error ${result.status}`, body: result.body };
  }

  try {
    return { query, results: JSON.parse(result.body) };
  } catch {
    return { query, raw: result.body };
  }
}

// ---------------------------------------------------------------------------
// Tool: brightdata_dataset
// ---------------------------------------------------------------------------

async function brightdataDataset({ datasetId, snapshotId }) {
  if (!datasetId) throw new Error("datasetId is required");

  const path = snapshotId
    ? `/datasets/v3/snapshot/${snapshotId}?format=json`
    : `/datasets/v3/datasets/${datasetId}/snapshots?per_page=1`;

  const result = await httpsRequest({
    hostname: "api.brightdata.com",
    path,
    method: "GET",
    headers: {
      "Authorization": `Bearer ${BRIGHTDATA_API_TOKEN}`,
    },
  });

  if (result.status !== 200) {
    return { error: `BrightData Dataset error ${result.status}`, body: result.body };
  }

  try {
    return { datasetId, data: JSON.parse(result.body) };
  } catch {
    return { datasetId, raw: result.body };
  }
}

// ---------------------------------------------------------------------------
// Tool: brightdata_proxy_fetch
// ---------------------------------------------------------------------------

async function brightdataProxyFetch({ url, method, headers: extraHeaders }) {
  if (!url) throw new Error("url is required");

  const parsed = new URL(url);

  // Route through BrightData proxy using their gateway
  const result = await httpsRequest({
    hostname: "brd.superproxy.io",
    port: 22225,
    path: url,
    method: method ?? "GET",
    headers: {
      "Proxy-Authorization": `Basic ${Buffer.from(`brd-customer-${BRIGHTDATA_ZONE}:${BRIGHTDATA_API_TOKEN}`).toString("base64")}`,
      "Host": parsed.hostname,
      ...(extraHeaders ?? {}),
    },
  });

  return {
    url,
    status: result.status,
    body: result.body.slice(0, 8000), // truncate large responses
    via: "brightdata_residential_proxy",
  };
}

// ---------------------------------------------------------------------------
// MCP Server setup
// ---------------------------------------------------------------------------

const server = new Server(
  { name: "mcp-brightdata", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "brightdata_scrape",
      description: "Scrape a URL using BrightData's Scraping Browser. Bypasses bot protection and renders JavaScript. Returns full HTML content.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to scrape" },
          waitFor: { type: "string", description: "CSS selector to wait for before returning content" },
          javascript: { type: "boolean", description: "Render JavaScript (default: false for speed)" },
        },
        required: ["url"],
      },
    },
    {
      name: "brightdata_search",
      description: "Search the web via BrightData SERP API. Returns top search results with titles, URLs, and snippets.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          country: { type: "string", description: "Country code for localized results (default: mx)" },
          count: { type: "number", description: "Number of results (default: 10, max: 50)" },
        },
        required: ["query"],
      },
    },
    {
      name: "brightdata_dataset",
      description: "Fetch data from a BrightData marketplace dataset. Useful for competitor intelligence, pricing data, and market research.",
      inputSchema: {
        type: "object",
        properties: {
          datasetId: { type: "string", description: "BrightData dataset ID" },
          snapshotId: { type: "string", description: "Specific snapshot ID (optional, defaults to latest)" },
        },
        required: ["datasetId"],
      },
    },
    {
      name: "brightdata_proxy_fetch",
      description: "Make an HTTP request through BrightData's residential proxy network. Use when you need a specific geo-located IP or to avoid rate limits.",
      inputSchema: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to fetch" },
          method: { type: "string", description: "HTTP method (default: GET)" },
          headers: { type: "object", description: "Additional HTTP headers" },
        },
        required: ["url"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    switch (name) {
      case "brightdata_scrape":
        result = await brightdataScrape(args);
        break;
      case "brightdata_search":
        result = await brightdataSearch(args);
        break;
      case "brightdata_dataset":
        result = await brightdataDataset(args);
        break;
      case "brightdata_proxy_fetch":
        result = await brightdataProxyFetch(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("[mcp-brightdata] BrightData MCP server started (stdio)");
