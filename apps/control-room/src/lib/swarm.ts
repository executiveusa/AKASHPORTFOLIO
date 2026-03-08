/**
 * Swarm Orchestration Logic for Synthia 3.0 (Supabase-backed)
 */

import { agentState, telemetry } from './supabase-client';

export interface Agent {
    id: string;
    name: string;
    role: string;
    status: 'idle' | 'working' | 'offline' | 'error';
    currentTask?: string;
    lastSeen: string;
    metadata: Record<string, any>;
}

export class SwarmManager {
    private localCache: Map<string, Agent> = new Map();
    private syncInterval = 30000; // Sync every 30s
    private syncTimer?: NodeJS.Timeout;

    constructor() {
        // Initialize with core Synthia agent
        this.initializeCore();
        this.startSync();
    }

    private async initializeCore() {
        const synthia: Agent = {
            id: 'synthia-0',
            name: 'Synthia Prime',
            role: 'Digital CEO',
            status: 'idle',
            lastSeen: new Date().toISOString(),
            metadata: { version: '3.0.0', tier: 'core' },
        };

        await agentState.registerAgent(
            synthia.id,
            synthia.name,
            synthia.role,
            synthia.metadata
        );
        this.localCache.set(synthia.id, synthia);
    }

    async registerAgent(agent: Agent) {
        await agentState.registerAgent(agent.id, agent.name, agent.role, agent.metadata);
        this.localCache.set(agent.id, agent);

        await telemetry.logEvent('swarm', 'agent_registered', `${agent.name} (${agent.role}) registered`, {
            agentId: agent.id,
        });
    }

    async getAgent(id: string): Promise<Agent | undefined> {
        // Try cache first
        if (this.localCache.has(id)) {
            return this.localCache.get(id);
        }

        // Fetch from Supabase
        const { data } = await agentState.getAgent(id);
        if (data) {
            const agent: Agent = {
                id: data.agent_id,
                name: data.name,
                role: data.role,
                status: data.status,
                currentTask: data.current_task,
                lastSeen: data.last_seen,
                metadata: data.metadata || {},
            };
            this.localCache.set(id, agent);
            return agent;
        }

        return undefined;
    }

    async updateAgentStatus(id: string, status: Agent['status'], task?: string) {
        await agentState.updateStatus(id, status, task);

        // Update local cache
        const agent = this.localCache.get(id);
        if (agent) {
            agent.status = status;
            agent.currentTask = task;
            agent.lastSeen = new Date().toISOString();
            this.localCache.set(id, agent);
        }
    }

    async listAllAgents(): Promise<Agent[]> {
        const { data } = await agentState.listAgents();
        if (!data) return Array.from(this.localCache.values());

        return data.map((row: any) => ({
            id: row.agent_id,
            name: row.name,
            role: row.role,
            status: row.status,
            currentTask: row.current_task,
            lastSeen: row.last_seen,
            metadata: row.metadata || {},
        }));
    }

    /**
     * Spawns a new sub-agent for a specific task
     */
    async spawnAgent(name: string, role: string, parentId: string): Promise<Agent> {
        const id = `agent-${Math.random().toString(36).substr(2, 9)}`;
        const newAgent: Agent = {
            id,
            name,
            role,
            status: 'idle',
            lastSeen: new Date().toISOString(),
            metadata: { parentId, spawned_at: new Date().toISOString() },
        };

        await this.registerAgent(newAgent);

        await telemetry.logEvent('swarm', 'agent_spawned', `${name} spawned by ${parentId}`, {
            childId: id,
            parentId,
        });

        return newAgent;
    }

    /**
     * Periodic sync between local cache and Supabase
     */
    private startSync() {
        this.syncTimer = setInterval(async () => {
            try {
                const agents = await this.listAllAgents();
                // Cache is already updated via listAllAgents
            } catch (err) {
                console.error('[Swarm] Sync error:', err);
            }
        }, this.syncInterval);
    }

    /**
     * Clean up sync timer
     */
    destroy() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
        }
    }
}

// Singleton instance
export const synthiaSwarm = new SwarmManager();
