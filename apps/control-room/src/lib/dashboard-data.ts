export type TrendDirection = "up" | "down";

export interface DashboardKpi {
    id: string;
    label: string;
    value: string;
    change: string;
    direction: TrendDirection;
}

export interface PipelineStage {
    id: string;
    stage: string;
    count: number;
    owners: string[];
}

export interface RegionalSignal {
    region: string;
    marketPulse: number;
    activeDeals: number;
    slaMinutes: number;
}

export interface AlertItem {
    id: string;
    title: string;
    level: "info" | "warning" | "critical";
    owner: string;
    eta: string;
}

export interface DashboardSnapshot {
    generatedAt: string;
    kpis: DashboardKpi[];
    pipeline: PipelineStage[];
    regions: RegionalSignal[];
    alerts: AlertItem[];
}

/** Honest empty snapshot — rendered until live API data is available. */
export function getDashboardSnapshot(referenceDate = new Date()): DashboardSnapshot {
    return {
        generatedAt: referenceDate.toISOString(),
        kpis: [
            { id: "revenue",     label: "Ingresos del mes",     value: "—", change: "sin datos", direction: "up" },
            { id: "conversion",  label: "Conversión lead→cierre", value: "—", change: "sin datos", direction: "up" },
            { id: "sla",         label: "SLA de respuesta",     value: "—", change: "sin datos", direction: "up" },
            { id: "utilization", label: "Uso de agentes",       value: "—", change: "sin datos", direction: "up" },
        ],
        pipeline: [
            { id: "qualification", stage: "Prospección",   count: 0, owners: [] },
            { id: "proposal",      stage: "Propuesta",     count: 0, owners: [] },
            { id: "delivery",      stage: "Entrega",       count: 0, owners: [] },
        ],
        regions: [
            { region: "México / LATAM", marketPulse: 0, activeDeals: 0, slaMinutes: 0 },
            { region: "España",         marketPulse: 0, activeDeals: 0, slaMinutes: 0 },
            { region: "Puerto Rico",    marketPulse: 0, activeDeals: 0, slaMinutes: 0 },
        ],
        alerts: [],
    };
}
