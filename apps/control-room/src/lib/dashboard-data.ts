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

const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);

const computePulse = (seed: number) => 72 + (seed % 19);

export function getDashboardSnapshot(referenceDate = new Date()): DashboardSnapshot {
    const minuteSeed = referenceDate.getUTCMinutes() + referenceDate.getUTCDate() * 3;

    return {
        generatedAt: referenceDate.toISOString(),
        kpis: [
            {
                id: "revenue",
                label: "Monthly Revenue Run Rate",
                value: formatCurrency(182000 + minuteSeed * 42),
                change: "+6.8%",
                direction: "up",
            },
            {
                id: "conversion",
                label: "Lead-to-Close Conversion",
                value: `${28 + (minuteSeed % 6)}%`,
                change: "+2.1 pts",
                direction: "up",
            },
            {
                id: "sla",
                label: "Average Response SLA",
                value: `${45 - (minuteSeed % 8)} min`,
                change: "-5 min",
                direction: "up",
            },
            {
                id: "utilization",
                label: "Agent Utilization",
                value: `${76 + (minuteSeed % 7)}%`,
                change: "-1.4 pts",
                direction: "down",
            },
        ],
        pipeline: [
            {
                id: "qualification",
                stage: "Qualification",
                count: 18 + (minuteSeed % 4),
                owners: ["Acquisition Bot", "Discovery Analyst"],
            },
            {
                id: "proposal",
                stage: "Proposal + Scope",
                count: 9 + (minuteSeed % 3),
                owners: ["Synthia", "Offer Strategist"],
            },
            {
                id: "delivery",
                stage: "Delivery Pods",
                count: 12 + (minuteSeed % 5),
                owners: ["Design Ops", "Growth Engineering"],
            },
        ],
        regions: [
            {
                region: "Mexico / LATAM",
                marketPulse: computePulse(minuteSeed + 2),
                activeDeals: 17 + (minuteSeed % 6),
                slaMinutes: 33 + (minuteSeed % 5),
            },
            {
                region: "US West",
                marketPulse: computePulse(minuteSeed + 7),
                activeDeals: 8 + (minuteSeed % 4),
                slaMinutes: 27 + (minuteSeed % 6),
            },
            {
                region: "EU / Spain",
                marketPulse: computePulse(minuteSeed + 11),
                activeDeals: 6 + (minuteSeed % 3),
                slaMinutes: 35 + (minuteSeed % 4),
            },
            {
                region: "India Partnerships",
                marketPulse: computePulse(minuteSeed + 14),
                activeDeals: 5 + (minuteSeed % 2),
                slaMinutes: 41 + (minuteSeed % 7),
            },
        ],
        alerts: [
            {
                id: "a1",
                title: "2 enterprise proposals require final signature review",
                level: "warning",
                owner: "Deal Desk",
                eta: "Today 14:00",
            },
            {
                id: "a2",
                title: "SEO crawler flagged 3 landing pages for metadata drift",
                level: "info",
                owner: "Web Ops Agent",
                eta: "Today 11:30",
            },
            {
                id: "a3",
                title: "Client SLO risk on TANDA CDMX deployment",
                level: "critical",
                owner: "Reliability Pod",
                eta: "Immediate",
            },
        ],
    };
}
