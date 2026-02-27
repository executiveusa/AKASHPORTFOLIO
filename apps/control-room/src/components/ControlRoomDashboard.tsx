"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { DashboardSnapshot } from "@/lib/dashboard-data";

const REFRESH_INTERVAL_MS = 60000;

function levelClass(level: DashboardSnapshot["alerts"][number]["level"]) {
    if (level === "critical") return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    if (level === "warning") return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
}

export default function ControlRoomDashboard() {
    const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboard = useCallback(async () => {
        const response = await fetch("/api/dashboard", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Dashboard request failed with status ${response.status}`);
        }

        const payload = (await response.json()) as DashboardSnapshot;
        setSnapshot(payload);
        setError(null);
    }, []);

    useEffect(() => {
        let active = true;

        const run = async () => {
            try {
                await fetchDashboard();
            } catch (err) {
                if (!active) return;
                const message = err instanceof Error ? err.message : "Unknown dashboard error";
                setError(message);
            }
        };

        run();
        const interval = window.setInterval(run, REFRESH_INTERVAL_MS);

        return () => {
            active = false;
            window.clearInterval(interval);
        };
    }, [fetchDashboard]);

    const generatedLabel = useMemo(() => {
        if (!snapshot?.generatedAt) return "Loading data stream...";

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        }).format(new Date(snapshot.generatedAt));
    }, [snapshot?.generatedAt]);

    if (!snapshot && !error) {
        return (
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-300">
                Booting enhanced dashboard feed...
            </section>
        );
    }

    if (error && !snapshot) {
        return (
            <section className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-8 text-rose-200">
                Unable to load dashboard data: {error}
            </section>
        );
    }

    if (!snapshot) return null;

    return (
        <section className="flex flex-col gap-8">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">Enhanced Agency Dashboard</h2>
                <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">Live Sync {generatedLabel}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {snapshot.kpis.map((kpi) => (
                    <article key={kpi.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{kpi.label}</p>
                        <p className="mt-3 text-3xl font-bold tracking-tight text-zinc-100">{kpi.value}</p>
                        <p className={`mt-2 text-sm ${kpi.direction === "up" ? "text-emerald-400" : "text-amber-300"}`}>{kpi.change}</p>
                    </article>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {snapshot.pipeline.map((stage) => (
                    <article key={stage.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Pipeline Stage</p>
                        <h3 className="mt-3 text-xl font-semibold text-zinc-100">{stage.stage}</h3>
                        <p className="mt-2 text-sm text-zinc-400">{stage.owners.join(" • ")}</p>
                        <p className="mt-4 text-4xl font-bold text-zinc-100">{stage.count}</p>
                    </article>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">Regional Intelligence</h3>
                    <div className="mt-4 space-y-3">
                        {snapshot.regions.map((region) => (
                            <div key={region.region} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4">
                                <p className="text-sm font-semibold text-zinc-100">{region.region}</p>
                                <div className="mt-2 grid grid-cols-3 gap-2 text-xs uppercase tracking-[0.15em] text-zinc-400">
                                    <span>Pulse {region.marketPulse}</span>
                                    <span>Deals {region.activeDeals}</span>
                                    <span>SLA {region.slaMinutes}m</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </article>

                <article className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-400">Priority Alerts</h3>
                    <div className="mt-4 space-y-3">
                        {snapshot.alerts.map((alert) => (
                            <div key={alert.id} className={`rounded-xl border p-4 ${levelClass(alert.level)}`}>
                                <p className="text-sm font-semibold">{alert.title}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.15em]">
                                    {alert.owner} • ETA {alert.eta}
                                </p>
                            </div>
                        ))}
                    </div>
                </article>
            </div>

            {error ? <p className="text-xs text-amber-300">Live sync warning: {error}</p> : null}
        </section>
    );
}
