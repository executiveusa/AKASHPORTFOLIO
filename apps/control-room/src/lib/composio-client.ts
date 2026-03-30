/**
 * composio-client.ts — Composio integration for SYNTHIA™ control-room
 *
 * Provides a TypeScript client for the Composio API, enabling
 * sphere agents to invoke third-party tools (GitHub, Slack,
 * Google Workspace, Notion, etc.) via Composio's unified API.
 *
 * Mirrors the Rust provider at backend/src/providers/composio.rs
 * for the Next.js server environment.
 */

const COMPOSIO_API_BASE = "https://api.composio.dev/api/v1";

export interface ComposioToolResult {
  success: boolean;
  data: Record<string, unknown>;
  error?: string;
}

export interface ComposioTool {
  name: string;
  description: string;
  app: string;
  parameters: Record<string, unknown>;
}

function getApiKey(): string {
  const key = process.env.COMPOSIO_API_KEY;
  if (!key) throw new Error("[composio] COMPOSIO_API_KEY not set");
  return key;
}

async function composioFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = getApiKey();
  return fetch(`${COMPOSIO_API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": apiKey,
      ...options.headers,
    },
  });
}

/** List available Composio tools for an integration */
export async function listTools(app?: string): Promise<ComposioTool[]> {
  const params = app ? `?app=${encodeURIComponent(app)}` : "";
  const res = await composioFetch(`/tools${params}`);
  if (!res.ok) {
    console.warn("[composio] listTools failed:", res.status);
    return [];
  }
  const body = await res.json();
  return (body.tools ?? body.items ?? []) as ComposioTool[];
}

/** Execute a Composio tool by name */
export async function executeTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<ComposioToolResult> {
  const res = await composioFetch("/tools/execute", {
    method: "POST",
    body: JSON.stringify({ tool: toolName, args }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown error");
    return { success: false, data: {}, error: `Composio ${res.status}: ${text}` };
  }

  const data = await res.json();
  return { success: true, data };
}

/** Run a multi-step Composio workflow */
export async function executeWorkflow(
  workflow: Record<string, unknown>
): Promise<ComposioToolResult> {
  const res = await composioFetch("/workflows/execute", {
    method: "POST",
    body: JSON.stringify(workflow),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "unknown error");
    return { success: false, data: {}, error: `Composio workflow ${res.status}: ${text}` };
  }

  const data = await res.json();
  return { success: true, data };
}

/**
 * Pre-configured tool shortcuts for common sphere operations.
 * Each function maps to a specific Composio integration.
 */
export const tools = {
  /** GitHub: create issue in a repo */
  async githubCreateIssue(repo: string, title: string, body: string) {
    return executeTool("github_create_issue", { repo, title, body });
  },

  /** GitHub: list open PRs */
  async githubListPRs(repo: string) {
    return executeTool("github_list_pull_requests", { repo, state: "open" });
  },

  /** Google Calendar: create event */
  async gcalCreateEvent(
    summary: string,
    start: string,
    end: string,
    attendees?: string[]
  ) {
    return executeTool("googlecalendar_create_event", {
      summary,
      start,
      end,
      attendees,
    });
  },

  /** Slack: send message to channel */
  async slackSend(channel: string, text: string) {
    return executeTool("slack_send_message", { channel, text });
  },

  /** Notion: create page */
  async notionCreatePage(databaseId: string, properties: Record<string, unknown>) {
    return executeTool("notion_create_page", { database_id: databaseId, properties });
  },
};
