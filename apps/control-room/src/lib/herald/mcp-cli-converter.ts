/**
 * HERALD MCP→CLI Converter
 *
 * Converts MCP server tool schemas into lightweight CLI-style wrappers.
 * Key principle: send ONLY the cli_signature to the LLM for tool selection,
 * fetch the full schema ONLY when executing. This is the 96-99% token savings.
 *
 * This is our own implementation — no external mcp2cli dependency.
 * Integrates directly with Vibe Graph and tool_registrations table.
 */

interface MCPToolSchema {
  name: string;
  description?: string;
  inputSchema?: {
    type: string;
    properties?: Record<string, { type: string; description?: string }>;
    required?: string[];
  };
}

interface MCPServerManifest {
  server_name: string;
  tools: MCPToolSchema[];
}

export interface CLIWrapper {
  tool_id: string;
  tool_name: string;
  cli_signature: string;
  capability_summary: string;
  executor_config: Record<string, unknown>;
  full_schema: MCPToolSchema;
}

/**
 * Fetch tool manifests from a running MCP server.
 * Supports both HTTP (URL) and stdio (command) transport.
 */
export async function fetchMCPManifest(
  serverConfig: Record<string, unknown>
): Promise<MCPServerManifest | null> {
  const url = serverConfig.url as string | undefined;
  const command = serverConfig.command as string | undefined;

  if (url) {
    try {
      const toolsUrl = url.replace(/\/(sse|mcp)\/?$/, '') + '/tools/list';
      const res = await fetch(toolsUrl, {
        headers: (serverConfig.headers as Record<string, string>) ?? {},
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as {
        tools?: MCPToolSchema[];
        result?: { tools?: MCPToolSchema[] };
      };
      return {
        server_name: String(serverConfig.name ?? url.split('/').pop()),
        tools: data.tools ?? data.result?.tools ?? [],
      };
    } catch (err) {
      console.warn(
        `[herald/converter] Failed to fetch manifest from ${url}:`,
        (err as Error).message
      );
      return null;
    }
  }

  if (command) {
    try {
      const { spawn } = await import('child_process');
      const args = (serverConfig.args as string[] | undefined) ?? [];
      const env = {
        ...process.env,
        ...(serverConfig.env as Record<string, string> | undefined),
      };

      return new Promise<MCPServerManifest | null>((resolve) => {
        const proc = spawn(command, args, { env, stdio: ['pipe', 'pipe', 'pipe'] });
        let buffer = '';

        proc.stdout.on('data', (d: Buffer) => {
          buffer += d.toString();
          const lines = buffer.split('\n');
          for (const line of lines.slice(0, -1)) {
            try {
              const msg = JSON.parse(line) as { result?: { tools?: MCPToolSchema[] } };
              if (msg.result?.tools) {
                resolve({
                  server_name: String(serverConfig.name ?? command),
                  tools: msg.result.tools,
                });
                proc.kill();
              }
            } catch { /* skip non-JSON lines */ }
          }
          buffer = lines[lines.length - 1];
        });

        // Send tools/list request
        const request = JSON.stringify({
          jsonrpc: '2.0', id: 1, method: 'tools/list', params: {},
        });
        proc.stdin.write(request + '\n');

        setTimeout(() => {
          proc.kill();
          resolve(null);
        }, 5000);
      });
    } catch (err) {
      console.warn('[herald/converter] stdio MCP spawn failed:', err);
      return null;
    }
  }

  return null;
}

/**
 * Convert a single MCP tool schema to a CLI wrapper.
 * The CLI signature is the compact representation sent to LLMs.
 */
export function convertMCPToolToCLI(
  tool: MCPToolSchema,
  serverName: string,
  serverConfig: Record<string, unknown>
): CLIWrapper {
  const props = tool.inputSchema?.properties ?? {};
  const required = tool.inputSchema?.required ?? [];

  const requiredArgs = required.map(k => `--${k} <${k}>`).join(' ');
  const optionalArgs = Object.keys(props)
    .filter(k => !required.includes(k))
    .slice(0, 3)
    .map(k => `[--${k}]`)
    .join(' ');

  const cli_signature = `${tool.name} ${requiredArgs} ${optionalArgs}`.trim();

  const capability_summary = tool.description
    ? tool.description.split('.')[0].slice(0, 120)
    : `Execute ${tool.name} via ${serverName}`;

  return {
    tool_id: `${serverName}_${tool.name}`.replace(/[^a-z0-9_]/gi, '_').toLowerCase(),
    tool_name: tool.name,
    cli_signature,
    capability_summary,
    executor_config: {
      ...serverConfig,
      mcp_tool_name: tool.name,
      server_name: serverName,
    },
    full_schema: tool,
  };
}

/**
 * Convert an entire MCP server manifest to CLI wrappers and register them.
 */
export async function convertAndRegisterMCPServer(
  serverName: string,
  serverConfig: Record<string, unknown>
): Promise<number> {
  const manifest = await fetchMCPManifest(serverConfig);
  if (!manifest || manifest.tools.length === 0) {
    console.warn(`[herald/converter] No tools found for MCP server: ${serverName}`);
    return 0;
  }

  const { registerTool } = await import('./tool-registry');
  let count = 0;

  for (const mcpTool of manifest.tools) {
    const wrapper = convertMCPToolToCLI(mcpTool, serverName, serverConfig);
    await registerTool({
      tool_id: wrapper.tool_id,
      tool_name: wrapper.tool_name,
      executor_kind: 'mcp_server',
      executor_config: wrapper.executor_config,
      capabilities: inferMCPToolCapabilities(mcpTool),
      cli_signature: wrapper.cli_signature,
      auth_required: !!(serverConfig.headers || serverConfig.env),
      version: '1.0.0',
    });
    count++;
  }

  return count;
}

function inferMCPToolCapabilities(tool: MCPToolSchema): string[] {
  const text = `${tool.name} ${tool.description ?? ''}`.toLowerCase();
  const caps: string[] = [];

  const matchers: [RegExp, string][] = [
    [/email|gmail|send.*mail/, 'email'],
    [/slack|message|chat/, 'messaging'],
    [/database|query|sql|supabase/, 'database'],
    [/deploy|build|vercel|coolify/, 'deployment'],
    [/design|figma|canvas/, 'design'],
    [/code|github|repository|pull.request/, 'code'],
    [/payment|stripe|billing/, 'payments'],
    [/social|post|publish|instagram|twitter/, 'social_media'],
    [/analytic|metric|report|dashboard/, 'analytics'],
    [/search|find|query/, 'search'],
    [/create|generate|write/, 'content_creation'],
    [/notion|document|note/, 'knowledge_base'],
  ];

  for (const [regex, cap] of matchers) {
    if (regex.test(text)) caps.push(cap);
  }

  return caps.length > 0 ? caps : ['general'];
}
