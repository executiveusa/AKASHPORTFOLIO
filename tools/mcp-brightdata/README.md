# mcp-brightdata

BrightData MCP server for Synthia™ — web scraping, proxy network, and structured data extraction.

## Setup

```bash
cd tools/mcp-brightdata
npm install
```

## Configuration

Set in `.env.local` (already in master.env):

```
BRIGHTDATA_API_TOKEN=your_token_here
BRIGHTDATA_ZONE=residential_proxy
```

## Tools

| Tool | Description |
|------|-------------|
| `brightdata_scrape` | Scrape any URL with JS rendering + bot-bypass |
| `brightdata_search` | SERP search with country-local results |
| `brightdata_dataset` | Pull BrightData marketplace datasets |
| `brightdata_proxy_fetch` | Raw HTTP via residential proxy |

## Usage in Claude / Agents

Register in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "brightdata": {
      "command": "node",
      "args": ["tools/mcp-brightdata/index.js"],
      "env": {
        "BRIGHTDATA_API_TOKEN": "${BRIGHTDATA_API_TOKEN}"
      }
    }
  }
}
```

## Security Notes

- `BRIGHTDATA_API_TOKEN` is never committed to git (in `.gitignore` via `master.env` / `.env.local`)
- All proxy requests go through BrightData's network — no direct connections to target sites
- Response bodies are truncated to 8KB to prevent context overflow
