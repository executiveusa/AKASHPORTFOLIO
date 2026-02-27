/**
 * Swarm Orchestration Logic for Synthia 3.0
 */

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
    private agents: Map<string, Agent> = new Map();

    constructor() {
        // Initialize with core Synthia agent
        this.registerAgent({
            id: 'synthia-0',
            name: 'Synthia Prime',
            role: 'Digital CEO',
            status: 'idle',
            lastSeen: new Date().toISOString(),
            metadata: { version: '3.0.0' }
        });
    }

    registerAgent(agent: Agent) {
        this.agents.set(agent.id, agent);
        console.log(`Agent ${agent.name} (${agent.role}) registered to the swarm.`);
    }

    getAgent(id: string) {
        return this.agents.get(id);
    }

    updateAgentStatus(id: string, status: Agent['status'], task?: string) {
        const agent = this.agents.get(id);
        if (agent) {
            agent.status = status;
            agent.currentTask = task;
            agent.lastSeen = new Date().toISOString();
            this.agents.set(id, agent);
        }
    }

    listAllAgents() {
        return Array.from(this.agents.values());
    }

    /**
     * Spawns a new sub-agent for a specific task
     */
    async spawnAgent(name: string, role: string, parentId: string) {
        const id = `agent-${Math.random().toString(36).substr(2, 9)}`;
        const newAgent: Agent = {
            id,
            name,
            role,
            status: 'idle',
            lastSeen: new Date().toISOString(),
            metadata: { parentId }
        };
        this.registerAgent(newAgent);
        return newAgent;
    }
}

// Singleton instance
export const synthiaSwarm = new SwarmManager();
