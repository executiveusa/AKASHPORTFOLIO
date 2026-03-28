"use client";

/**
 * HeraldToolLibrary — Control Room UI
 *
 * Shows all registered tools from the HERALD tool registry.
 * - Grouped by executor_kind
 * - Color-coded by health status
 * - Quality score bar per tool
 * - "Run in HERALD" one-click execution modal
 * - Search/filter by capability
 * - Refresh registry button
 * - Realtime updates via Supabase polling (10s interval; replace with subscription if desired)
 */

import { useState, useEffect, useCallback } from "react";

interface ToolRecord {
  tool_id: string;
  tool_name: string;
  executor_kind: string;
  capabilities: string[];
  cli_signature: string;
  health_status: "healthy" | "degraded" | "offline" | "unknown";
  quality_score: number;
  usage_count: number;
  auth_required: boolean;
}

interface RunResult {
  success: boolean;
  output?: unknown;
  error?: string;
  latency_ms: number;
}

const EXECUTOR_LABELS: Record<string, string> = {
  mcp_server:    "MCP Server",
  cli_script:    "CLI Script",
  cli_anything:  "CLI-Anything",
  postiz:        "Postiz",
  composio:      "Composio",
  rust_provider: "Rust Provider",
  http_api:      "HTTP API",
};

const EXECUTOR_COLORS: Record<string, string> = {
  mcp_server:    "#8b5cf6",
  cli_script:    "#22c55e",
  cli_anything:  "#06b6d4",
  postiz:        "#f97316",
  composio:      "#eab308",
  rust_provider: "#ef4444",
  http_api:      "#d4af37",
};

const HEALTH_COLORS: Record<string, string> = {
  healthy:  "#22c55e",
  degraded: "#eab308",
  offline:  "#ef4444",
  unknown:  "#6b7280",
};

function QualityBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "#22c55e" : pct >= 50 ? "#eab308" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        flex: 1, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, overflow: "hidden",
      }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color, borderRadius: 2,
          transition: "width 0.3s ease",
        }} />
      </div>
      <span style={{ fontSize: 10, color, minWidth: 28, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

function ToolCard({
  tool,
  onRun,
}: {
  tool: ToolRecord;
  onRun: (tool: ToolRecord) => void;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(255,255,255,0.08)`,
      borderRadius: 8,
      padding: "10px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12, fontWeight: 600, color: "#e2e8f0",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {tool.tool_name}
          </div>
          <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>
            {tool.capabilities.slice(0, 3).join(" · ")}
          </div>
        </div>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: HEALTH_COLORS[tool.health_status] ?? "#6b7280",
          flexShrink: 0, marginTop: 3, marginLeft: 8,
        }} title={tool.health_status} />
      </div>

      {/* CLI signature */}
      <div style={{
        fontSize: 9, fontFamily: "monospace",
        color: "#64748b", background: "rgba(0,0,0,0.3)",
        padding: "3px 6px", borderRadius: 4,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
        {tool.cli_signature}
      </div>

      {/* Quality bar */}
      <QualityBar score={tool.quality_score} />

      {/* Footer row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{
          fontSize: 9, color: EXECUTOR_COLORS[tool.executor_kind] ?? "#d4af37",
          background: "rgba(255,255,255,0.06)",
          padding: "2px 6px", borderRadius: 3,
        }}>
          {EXECUTOR_LABELS[tool.executor_kind] ?? tool.executor_kind}
        </span>
        <button
          onClick={() => onRun(tool)}
          style={{
            fontSize: 10, color: "#f5d78c", background: "transparent",
            border: "1px solid rgba(245,215,140,0.3)", borderRadius: 4,
            padding: "2px 8px", cursor: "pointer",
          }}
        >
          ▶ Run
        </button>
      </div>
    </div>
  );
}

function RunModal({
  tool,
  onClose,
}: {
  tool: ToolRecord;
  onClose: () => void;
}) {
  const [argsJson, setArgsJson] = useState("{}");
  const [agentId, setAgentId] = useState("synthia");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    try {
      console.warn('[TODO] migrate: /api/herald/execute');
      setResult({ success: false, error: 'Herald execute migrating to SYNTHIA™ backend', latency_ms: 0 });
    } catch (err) {
      setResult({ success: false, error: (err as Error).message, latency_ms: 0 });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 12, padding: 24, width: 480, maxWidth: "calc(100vw - 32px)",
        maxHeight: "80vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
            Run: {tool.tool_name}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: 18 }}>×</button>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>CLI Signature</div>
          <code style={{ fontSize: 10, color: "#f5d78c", background: "rgba(0,0,0,0.3)", padding: "4px 8px", borderRadius: 4, display: "block" }}>
            {tool.cli_signature}
          </code>
        </div>

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>Agent ID</div>
          <select
            value={agentId}
            onChange={e => setAgentId(e.target.value)}
            style={{
              width: "100%", padding: "6px 8px", background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6,
              color: "#e2e8f0", fontSize: 12,
            }}
          >
            {["synthia","alex","cazadora","forjadora","seductora","consejo","dr-economia","dra-cultura","ing-teknos"].map(id => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>Args (JSON)</div>
          <textarea
            value={argsJson}
            onChange={e => setArgsJson(e.target.value)}
            rows={4}
            style={{
              width: "100%", padding: "6px 8px", background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6,
              color: "#e2e8f0", fontSize: 11, fontFamily: "monospace",
              resize: "vertical", boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={handleRun}
          disabled={running}
          style={{
            width: "100%", padding: "10px", background: "#f5d78c",
            color: "#1a1208", border: "none", borderRadius: 8,
            fontWeight: 700, fontSize: 13, cursor: running ? "wait" : "pointer",
            opacity: running ? 0.7 : 1,
          }}
        >
          {running ? "Running..." : "Execute Tool"}
        </button>

        {result && (
          <div style={{
            marginTop: 16, padding: 12,
            background: result.success ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            border: `1px solid ${result.success ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: result.success ? "#22c55e" : "#ef4444", marginBottom: 8 }}>
              {result.success ? `✓ Success (${result.latency_ms}ms)` : `✗ Error (${result.latency_ms}ms)`}
            </div>
            <pre style={{ fontSize: 10, color: "#94a3b8", margin: 0, overflow: "auto", maxHeight: 200 }}>
              {result.error ?? JSON.stringify(result.output, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HeraldToolLibrary() {
  const [tools, setTools] = useState<ToolRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [bootstrapping, setBootstrapping] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedExecutor, setSelectedExecutor] = useState<string>("all");
  const [runTool, setRunTool] = useState<ToolRecord | null>(null);

  const loadTools = useCallback(async () => {
    try {
      console.warn('[TODO] migrate: /api/herald');
      setTools([]);
    } catch {
      /* fail silently */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTools();
    const interval = setInterval(loadTools, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [loadTools]);

  const handleBootstrap = async () => {
    setBootstrapping(true);
    try {
      console.warn('[TODO] migrate: /api/herald bootstrap');
      await loadTools();
    } finally {
      setBootstrapping(false);
    }
  };

  const executorKinds = ["all", ...Array.from(new Set(tools.map(t => t.executor_kind)))];

  const filtered = tools.filter(t => {
    const matchesSearch = !search || [t.tool_name, ...t.capabilities, t.cli_signature]
      .some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesExecutor = selectedExecutor === "all" || t.executor_kind === selectedExecutor;
    return matchesSearch && matchesExecutor;
  });

  const grouped = filtered.reduce((acc, t) => {
    const key = t.executor_kind;
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {} as Record<string, ToolRecord[]>);

  return (
    <div style={{ fontFamily: "monospace", color: "#e2e8f0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#f5d78c" }}>HERALD Tool Library</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{tools.length} tools registered</div>
        </div>
        <button
          onClick={handleBootstrap}
          disabled={bootstrapping}
          style={{
            fontSize: 11, color: "#1a1208", background: "#f5d78c",
            border: "none", borderRadius: 6, padding: "6px 12px",
            cursor: bootstrapping ? "wait" : "pointer", fontWeight: 600,
          }}
        >
          {bootstrapping ? "Scanning..." : "↻ Refresh Registry"}
        </button>
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search tools, capabilities..."
          style={{
            flex: 1, padding: "6px 10px", background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
            color: "#e2e8f0", fontSize: 12,
          }}
        />
        <select
          value={selectedExecutor}
          onChange={e => setSelectedExecutor(e.target.value)}
          style={{
            padding: "6px 8px", background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6,
            color: "#e2e8f0", fontSize: 11,
          }}
        >
          {executorKinds.map(k => (
            <option key={k} value={k}>
              {k === "all" ? "All executors" : EXECUTOR_LABELS[k] ?? k}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: 32 }}>Loading tools...</div>
      ) : tools.length === 0 ? (
        <div style={{ textAlign: "center", padding: 32 }}>
          <div style={{ color: "#64748b", marginBottom: 12 }}>No tools registered yet.</div>
          <button
            onClick={handleBootstrap}
            style={{
              color: "#f5d78c", background: "transparent",
              border: "1px solid rgba(245,215,140,0.4)", borderRadius: 6,
              padding: "8px 16px", cursor: "pointer", fontSize: 12,
            }}
          >
            Run Bootstrap to discover tools
          </button>
        </div>
      ) : (
        Object.entries(grouped).map(([kind, kindTools]) => (
          <div key={kind} style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: EXECUTOR_COLORS[kind] ?? "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.08em",
              marginBottom: 8,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{
                display: "inline-block", width: 8, height: 8, borderRadius: "50%",
                background: EXECUTOR_COLORS[kind] ?? "#94a3b8",
              }} />
              {EXECUTOR_LABELS[kind] ?? kind}
              <span style={{ color: "#475569", fontWeight: 400 }}>({kindTools.length})</span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: 8,
            }}>
              {kindTools.map(tool => (
                <ToolCard key={tool.tool_id} tool={tool} onRun={setRunTool} />
              ))}
            </div>
          </div>
        ))
      )}

      {/* Run modal */}
      {runTool && (
        <RunModal tool={runTool} onClose={() => setRunTool(null)} />
      )}
    </div>
  );
}
