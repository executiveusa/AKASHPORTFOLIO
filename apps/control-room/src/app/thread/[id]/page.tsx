"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/synthia/AppShell";
import { ThreadView } from "@/components/synthia/ThreadView";
import { AssetDock } from "@/components/synthia/AssetDock";
import { SubagentDispatchCard } from "@/components/synthia/SubagentDispatchCard";
import { ReasoningBlock } from "@/components/synthia/ReasoningBlock";
import { useEffect, useState } from "react";

interface ThreadMeta {
  id: string;
  title: string;
  agent_id: string;
  status: string;
  execution_mode: string;
  subagent_jobs?: Array<{
    id: string;
    agent_name: string;
    task: string;
    status: "pending" | "running" | "done" | "error";
    result?: string;
    started_at?: string;
    finished_at?: string;
  }>;
  reasoning?: {
    summary?: string;
    steps?: string[];
    tokens_used?: number;
  };
}

export default function ThreadDetailPage() {
  const params = useParams();
  const threadId = params.id as string;
  const [meta, setMeta] = useState<ThreadMeta | null>(null);

  useEffect(() => {
    fetch(`/api/synthia/thread/${threadId}`)
      .then(r => r.json())
      .then(d => { if (d.thread) setMeta(d.thread); })
      .catch(() => {});
  }, [threadId]);

  return (
    <AppShell fullWidth>
      <div style={{ display: "flex", height: "100vh" }}>
        {/* Main thread */}
        <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {meta && (
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0d0d0d", marginBottom: 4 }}>
                {meta.title || "Tarea sin título"}
              </h1>
              <div style={{ display: "flex", gap: 12, fontSize: 12, color: "#888" }}>
                <span>{meta.agent_id}</span>
                <span>·</span>
                <span style={{ textTransform: "capitalize" }}>{meta.execution_mode}</span>
                <span>·</span>
                <span style={{ textTransform: "capitalize" }}>{meta.status}</span>
              </div>
            </div>
          )}

          {meta?.reasoning && (
            <ReasoningBlock
              summary={meta.reasoning.summary}
              steps={meta.reasoning.steps}
              tokensUsed={meta.reasoning.tokens_used}
            />
          )}

          <ThreadView threadId={threadId} />
        </div>

        {/* Right panel */}
        <div
          style={{
            width: 280, borderLeft: "1px solid #e5e3df",
            padding: "32px 20px", overflowY: "auto", background: "#fafaf8",
          }}
        >
          <AssetDock threadId={threadId} />

          {meta?.subagent_jobs && meta.subagent_jobs.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <SubagentDispatchCard jobs={meta.subagent_jobs} />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
