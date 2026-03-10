/**
 * Swarm Manager — KUPURI MEDIA™ Synthia 3.0
 *
 * Manages the full KUPURI MEDIA agent roster.
 * Agents are defined in /agents/*.md and loaded at runtime.
 * Tracks goals, accountability, status, and inter-agent dependencies.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface AgentGoal {
    id: string;
    title: string;
    description: string;
    kpi: string;
    target: string | number;
    current: string | number;
    deadline: string;
    status: 'on_track' | 'at_risk' | 'achieved' | 'failed';
    lastUpdated: string;
}

export interface Agent {
    id: string;
    name: string;
    role: string;
    color: string;
    status: 'idle' | 'working' | 'offline' | 'error';
    currentTask?: string;
    lastSeen: string;
    goals: AgentGoal[];
    accountability: {
        tasksCompleted: number;
        tasksTotal: number;
        errorRate: number;
        avgResponseTime: number;
        qualityScore: number;
        lastCoachingDate?: string;
    };
    metadata: {
        version: string;
        parentId?: string;
        teamId: string;
        mdFile?: string;
        tools: string[];
        [key: string]: unknown;
    };
}

const AGENT_DEFINITIONS_PATH = path.join(process.cwd(), 'apps/control-room/agents');
const TEAM_ID = process.env.MINIMAX_TEAM_ID || '2015968731565396613';

function loadAgentFromMd(filePath: string): Partial<Agent> | null {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!frontmatterMatch) return null;

        const frontmatter = frontmatterMatch[1];
        const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
        const colorMatch = frontmatter.match(/^color:\s*(.+)$/m);
        const descMatch = frontmatter.match(/^description:\s*(.+)$/m);
        const toolsMatch = frontmatter.match(/^tools:\s*(.+)$/m);

        return {
            name: nameMatch?.[1]?.trim() || path.basename(filePath, '.md'),
            color: colorMatch?.[1]?.trim() || 'gray',
            role: descMatch?.[1]?.trim().split(' — ')[0] || 'Agente',
            metadata: {
                version: '3.0.0',
                teamId: TEAM_ID,
                mdFile: filePath,
                tools: toolsMatch?.[1]?.split(',').map((t: string) => t.trim()) || [],
            },
        };
    } catch {
        return null;
    }
}

const CORE_AGENTS: Agent[] = [
    {
        id: 'synthia-0',
        name: 'Synthia Prime',
        role: 'CEO Digital (Moderadora)',
        color: 'magenta',
        status: 'idle',
        lastSeen: new Date().toISOString(),
        goals: [{
            id: 'goal-mrr',
            title: 'Monthly Recurring Revenue',
            description: 'Crecer MRR de la agencia 20% mes a mes',
            kpi: 'MRR Growth',
            target: '20% MoM',
            current: 'Ver dashboard',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'on_track',
            lastUpdated: new Date().toISOString(),
        }],
        accountability: { tasksCompleted: 0, tasksTotal: 0, errorRate: 0, avgResponseTime: 15, qualityScore: 90 },
        metadata: { version: '3.0.0', teamId: TEAM_ID, mdFile: path.join(AGENT_DEFINITIONS_PATH, 'synthia-prime.md'), tools: ['WebFetch', 'WebSearch', 'Read', 'Write', 'Edit', 'Bash'] },
    },
    {
        id: 'ralphy-1',
        name: 'Ralphy',
        role: 'Microsoft Lightning Coach',
        color: 'blue',
        status: 'idle',
        lastSeen: new Date().toISOString(),
        goals: [{
            id: 'goal-quality',
            title: 'Zero Deuda Técnica Crítica',
            description: 'Mantener 0 items críticos pendientes',
            kpi: 'Critical debt items',
            target: 0,
            current: 0,
            deadline: 'Rolling',
            status: 'on_track',
            lastUpdated: new Date().toISOString(),
        }],
        accountability: { tasksCompleted: 0, tasksTotal: 0, errorRate: 0, avgResponseTime: 20, qualityScore: 95 },
        metadata: { version: '3.0.0', teamId: TEAM_ID, mdFile: path.join(AGENT_DEFINITIONS_PATH, 'ralphy.md'), tools: ['Read', 'Write', 'Edit', 'Bash', 'WebSearch'] },
    },
    {
        id: 'indigo-2',
        name: 'Indigo',
        role: 'Growth Hacker & Marketing',
        color: 'cyan',
        status: 'idle',
        lastSeen: new Date().toISOString(),
        goals: [{
            id: 'goal-leads',
            title: 'Leads Calificados por Mes',
            description: 'Generar ≥20 leads calificados',
            kpi: 'Qualified leads/month',
            target: 20,
            current: 0,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'on_track',
            lastUpdated: new Date().toISOString(),
        }],
        accountability: { tasksCompleted: 0, tasksTotal: 0, errorRate: 0, avgResponseTime: 30, qualityScore: 85 },
        metadata: { version: '3.0.0', teamId: TEAM_ID, mdFile: path.join(AGENT_DEFINITIONS_PATH, 'indigo.md'), tools: ['WebFetch', 'WebSearch', 'Write', 'Edit', 'Bash'] },
    },
    {
        id: 'lapina-3',
        name: 'Lapina',
        role: 'Content Creator & Social Media',
        color: 'pink',
        status: 'idle',
        lastSeen: new Date().toISOString(),
        goals: [{
            id: 'goal-engagement',
            title: 'Engagement Rate ≥5%',
            description: 'Mantener engagement rate consistente',
            kpi: 'Engagement rate',
            target: '5%',
            current: 'N/A',
            deadline: 'Rolling',
            status: 'on_track',
            lastUpdated: new Date().toISOString(),
        }],
        accountability: { tasksCompleted: 0, tasksTotal: 0, errorRate: 0, avgResponseTime: 25, qualityScore: 88 },
        metadata: { version: '3.0.0', teamId: TEAM_ID, mdFile: path.join(AGENT_DEFINITIONS_PATH, 'lapina.md'), tools: ['WebFetch', 'WebSearch', 'Write', 'Edit', 'Read'] },
    },
    {
        id: 'clandestino-4',
        name: 'Clandestino',
        role: 'Sales & Business Development',
        color: 'orange',
        status: 'idle',
        lastSeen: new Date().toISOString(),
        goals: [{
            id: 'goal-close',
            title: 'Deal Close Rate ≥35%',
            description: 'Cerrar 35% de propuestas enviadas',
            kpi: 'Proposal close rate',
            target: '35%',
            current: 'N/A',
            deadline: 'Rolling',
            status: 'on_track',
            lastUpdated: new Date().toISOString(),
        }],
        accountability: { tasksCompleted: 0, tasksTotal: 0, errorRate: 0, avgResponseTime: 20, qualityScore: 87 },
        metadata: { version: '3.0.0', teamId: TEAM_ID, mdFile: path.join(AGENT_DEFINITIONS_PATH, 'clandestino.md'), tools: ['WebFetch', 'WebSearch', 'Write', 'Read', 'Edit'] },
    },
    {
        id: 'merlina-5',
        name: 'Merlina',
        role: 'Directora Creativa',
        color: 'purple',
        status: 'idle',
        lastSeen: new Date().toISOString(),
        goals: [{
            id: 'goal-delivery',
            title: 'On-Time Delivery ≥95%',
            description: 'Entregar proyectos creativos a tiempo',
            kpi: 'On-time delivery rate',
            target: '95%',
            current: 'N/A',
            deadline: 'Rolling',
            status: 'on_track',
            lastUpdated: new Date().toISOString(),
        }],
        accountability: { tasksCompleted: 0, tasksTotal: 0, errorRate: 0, avgResponseTime: 60, qualityScore: 92 },
        metadata: { version: '3.0.0', teamId: TEAM_ID, mdFile: path.join(AGENT_DEFINITIONS_PATH, 'merlina.md'), tools: ['Read', 'Write', 'Edit', 'WebFetch', 'WebSearch'] },
    },
    {
        id: 'morpho-6',
        name: 'Morpho',
        role: 'Analytics & Intelligence',
        color: 'yellow',
        status: 'idle',
        lastSeen: new Date().toISOString(),
        goals: [{
            id: 'goal-anomaly',
            title: 'Anomaly Detection <2h',
            description: 'Detectar y alertar anomalías de KPI en <2 horas',
            kpi: 'Anomaly response time',
            target: '< 2 hours',
            current: 'N/A',
            deadline: 'Rolling',
            status: 'on_track',
            lastUpdated: new Date().toISOString(),
        }],
        accountability: { tasksCompleted: 0, tasksTotal: 0, errorRate: 0, avgResponseTime: 10, qualityScore: 93 },
        metadata: { version: '3.0.0', teamId: TEAM_ID, mdFile: path.join(AGENT_DEFINITIONS_PATH, 'morpho.md'), tools: ['Read', 'Write', 'Edit', 'Bash', 'WebFetch'] },
    },
    {
        id: 'ivette-voice-7',
        name: 'Ivette Voice',
        role: 'Brand Guardian & Founder Voice',
        color: 'gold',
        status: 'idle',
        lastSeen: new Date().toISOString(),
        goals: [{
            id: 'goal-brand',
            title: 'Brand Voice Consistency 100%',
            description: '100% de piezas pasan el checklist de voz de marca',
            kpi: 'Brand voice consistency',
            target: '100%',
            current: 'N/A',
            deadline: 'Rolling',
            status: 'on_track',
            lastUpdated: new Date().toISOString(),
        }],
        accountability: { tasksCompleted: 0, tasksTotal: 0, errorRate: 0, avgResponseTime: 20, qualityScore: 94 },
        metadata: { version: '3.0.0', teamId: TEAM_ID, mdFile: path.join(AGENT_DEFINITIONS_PATH, 'ivette-voice.md'), tools: ['Read', 'Write', 'Edit', 'WebFetch'] },
    },
];

class SwarmManager {
    private agents: Map<string, Agent> = new Map();

    constructor() {
        for (const agent of CORE_AGENTS) {
            this.agents.set(agent.id, agent);
        }
        // Attempt to enrich from .md files
        this.syncFromMarkdown();
    }

    private syncFromMarkdown() {
        if (!fs.existsSync(AGENT_DEFINITIONS_PATH)) return;
        const files = fs.readdirSync(AGENT_DEFINITIONS_PATH).filter(f => f.endsWith('.md') && !f.startsWith('_'));
        for (const file of files) {
            const mdData = loadAgentFromMd(path.join(AGENT_DEFINITIONS_PATH, file));
            if (mdData?.name) {
                const existing = Array.from(this.agents.values()).find(a => a.name === mdData.name);
                if (existing && mdData.metadata) {
                    existing.metadata = { ...existing.metadata, ...mdData.metadata };
                    this.agents.set(existing.id, existing);
                }
            }
        }
    }

    registerAgent(agent: Agent): void {
        this.agents.set(agent.id, agent);
    }

    getAgent(id: string): Agent | undefined {
        return this.agents.get(id);
    }

    getAgentByName(name: string): Agent | undefined {
        return Array.from(this.agents.values())
            .find(a => a.name.toLowerCase().replace(/\s+/g, '-') === name.toLowerCase());
    }

    updateAgentStatus(id: string, status: Agent['status'], currentTask?: string): void {
        const agent = this.agents.get(id);
        if (agent) {
            agent.status = status;
            agent.currentTask = currentTask;
            agent.lastSeen = new Date().toISOString();
            this.agents.set(id, agent);
        }
    }

    updateGoalProgress(agentId: string, goalId: string, current: string | number, status: AgentGoal['status']): void {
        const agent = this.agents.get(agentId);
        if (agent) {
            const goal = agent.goals.find(g => g.id === goalId);
            if (goal) {
                goal.current = current;
                goal.status = status;
                goal.lastUpdated = new Date().toISOString();
            }
            this.agents.set(agentId, agent);
        }
    }

    updateQualityScore(agentId: string, score: number): void {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.accountability.qualityScore = Math.min(100, Math.max(0, score));
            agent.accountability.lastCoachingDate = new Date().toISOString();
            this.agents.set(agentId, agent);
        }
    }

    incrementTaskCount(agentId: string, completed: boolean): void {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.accountability.tasksTotal += 1;
            if (completed) agent.accountability.tasksCompleted += 1;
            const errorCount = agent.accountability.tasksTotal - agent.accountability.tasksCompleted;
            agent.accountability.errorRate = errorCount / agent.accountability.tasksTotal;
            this.agents.set(agentId, agent);
        }
    }

    listAllAgents(): Agent[] {
        return Array.from(this.agents.values());
    }

    getActiveAgents(): Agent[] {
        return this.listAllAgents().filter(a => a.status !== 'offline');
    }

    spawnAgent(name: string, role: string, parentId?: string): Agent {
        const id = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const agent: Agent = {
            id,
            name,
            role,
            color: 'gray',
            status: 'idle',
            lastSeen: new Date().toISOString(),
            goals: [],
            accountability: { tasksCompleted: 0, tasksTotal: 0, errorRate: 0, avgResponseTime: 30, qualityScore: 75 },
            metadata: { version: '3.0.0', teamId: TEAM_ID, parentId, tools: [] },
        };
        this.agents.set(id, agent);
        return agent;
    }

    getSwarmHealth(): {
        total: number; working: number; idle: number; error: number;
        avgQualityScore: number; goalsOnTrack: number; goalsAtRisk: number;
    } {
        const all = this.listAllAgents();
        const goals = all.flatMap(a => a.goals);
        const avgQuality = all.length > 0
            ? Math.round(all.reduce((sum, a) => sum + a.accountability.qualityScore, 0) / all.length)
            : 0;
        return {
            total: all.length,
            working: all.filter(a => a.status === 'working').length,
            idle: all.filter(a => a.status === 'idle').length,
            error: all.filter(a => a.status === 'error').length,
            avgQualityScore: avgQuality,
            goalsOnTrack: goals.filter(g => g.status === 'on_track' || g.status === 'achieved').length,
            goalsAtRisk: goals.filter(g => g.status === 'at_risk' || g.status === 'failed').length,
        };
    }
}

export const synthiaSwarm = new SwarmManager();
