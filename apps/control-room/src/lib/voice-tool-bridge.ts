/**
 * voice-tool-bridge.ts — VAPI → HERALD tool execution bridge
 *
 * When ALEX™ voice calls trigger tool invocations via VAPI,
 * this bridge resolves the tool name to a HERALD registration
 * and executes it through the appropriate executor (Composio,
 * CLI script, MCP server, or HTTP API).
 *
 * Used by /api/vapi/tools to dispatch tool calls.
 */

import { executeTool as composioExecute } from "@/lib/composio-client";

export type ToolExecutionResult = {
  success: boolean;
  output: string;
  data?: Record<string, unknown>;
};

/**
 * Executor dispatch table — maps HERALD executor_kind to a handler.
 * Each handler takes a tool config + arguments and returns a result.
 */
const EXECUTORS: Record<
  string,
  (
    config: Record<string, unknown>,
    args: Record<string, unknown>
  ) => Promise<ToolExecutionResult>
> = {
  composio: async (_config, args) => {
    const toolName = args._tool_name as string;
    if (!toolName) {
      return { success: false, output: "Missing _tool_name for Composio executor" };
    }
    const result = await composioExecute(toolName, args);
    return {
      success: result.success,
      output: result.error ?? JSON.stringify(result.data),
      data: result.data,
    };
  },

  http_api: async (config, args) => {
    const url = config.url as string;
    const method = (config.method as string) ?? "POST";
    if (!url) {
      return { success: false, output: "Missing url in http_api config" };
    }
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: method !== "GET" ? JSON.stringify(args) : undefined,
    });
    const text = await res.text();
    return { success: res.ok, output: text };
  },

  cli_script: async (config, args) => {
    // CLI scripts run in the Rust backend, not in Next.js serverless.
    // Forward to the backend API.
    const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";
    const res = await fetch(`${backendUrl}/api/tool/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        executor: "cli_script",
        config,
        args,
      }),
    });
    const text = await res.text();
    return { success: res.ok, output: text };
  },
};

/**
 * Execute a tool by HERALD tool_id.
 * Looks up the tool in the registry, dispatches to the right executor,
 * and returns a natural-language result suitable for voice responses.
 */
export async function executeVoiceTool(
  toolId: string,
  args: Record<string, unknown>
): Promise<ToolExecutionResult> {
  // Dynamic import to avoid SSR issues with fs-based registry
  let registration;
  try {
    const { lookupTool } = await import("@/lib/herald/tool-registry");
    registration = await lookupTool(toolId);
  } catch {
    // Registry unavailable — fall through to stub
  }

  if (!registration) {
    return {
      success: false,
      output: `Tool "${toolId}" not found in HERALD registry.`,
    };
  }

  const executor = EXECUTORS[registration.executor_kind];
  if (!executor) {
    return {
      success: false,
      output: `No executor for kind "${registration.executor_kind}".`,
    };
  }

  return executor(registration.executor_config, {
    ...args,
    _tool_name: registration.tool_name,
  });
}

/**
 * Map a VAPI tool-call name to a HERALD tool_id.
 * VAPI uses short names like "search_knowledge"; HERALD uses
 * prefixed IDs like "mcp_knowledge_search". This map bridges them.
 */
const VAPI_TO_HERALD: Record<string, string> = {
  get_sphere_status: "internal_sphere_status",
  run_council_meeting: "internal_council_meeting",
  search_knowledge: "internal_knowledge_search",
  create_task: "internal_task_create",
  get_analytics: "internal_analytics",
  github_create_issue: "composio_github_create_issue",
  slack_send: "composio_slack_send_message",
  calendar_book: "composio_gcal_create_event",
};

export function resolveVapiToolId(vapiName: string): string {
  return VAPI_TO_HERALD[vapiName] ?? vapiName;
}
