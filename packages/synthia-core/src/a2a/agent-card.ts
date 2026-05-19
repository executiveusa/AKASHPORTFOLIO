/**
 * A2A-inspired internal contract — AgentCard types.
 * NOT full A2A protocol compliance. Internal use only.
 */

export type AgentCapability =
  | 'read'
  | 'write'
  | 'deploy'
  | 'social'
  | 'email'
  | 'payment'
  | 'shell'
  | 'search'
  | 'status';

export type AgentRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AgentCard {
  /** Unique agent identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Agent role / job description */
  role: string;
  /** List of declared capabilities */
  capabilities: AgentCapability[];
  /** Declared risk level */
  riskLevel: AgentRiskLevel;
  /** Whether agent is currently active */
  active: boolean;
  /** ISO timestamp of registration */
  registeredAt: string;
  /** ISO timestamp of last update */
  updatedAt: string;
  /** Arbitrary metadata */
  metadata?: Record<string, unknown>;
}

export type CreateAgentCardInput = Omit<AgentCard, 'registeredAt' | 'updatedAt'>;

export function makeAgentCard(input: CreateAgentCardInput): AgentCard {
  const now = new Date().toISOString();
  return {
    ...input,
    registeredAt: now,
    updatedAt: now,
  };
}
