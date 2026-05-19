/**
 * A2A-inspired internal contract — Registry types.
 * NOT full A2A protocol compliance. Internal use only.
 */

import type { AgentCard } from './agent-card';

export interface RegistryEntry {
  agentId: string;
  endpoint?: string;
  status: 'registered' | 'active' | 'inactive' | 'deregistered';
  registeredAt: string;
  lastSeenAt?: string;
}

export interface RegistryState {
  entries: RegistryEntry[];
  totalAgents: number;
  activeAgents: number;
  snapshotAt: string;
}

export function buildRegistryState(
  entries: RegistryEntry[],
  _cards?: AgentCard[],
): RegistryState {
  const activeAgents = entries.filter((e) => e.status === 'active').length;
  return {
    entries,
    totalAgents: entries.length,
    activeAgents,
    snapshotAt: new Date().toISOString(),
  };
}
