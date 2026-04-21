/**
 * SphereCapabilities — Maps sphere agents to their specialized tool capabilities.
 * Each agent has primary and secondary capabilities that determine which tools
 * they can access and how they're routed by HERALD.
 */

import type { SphereAgentId } from './council-events';

export interface SphereCapability {
  agentId: SphereAgentId;
  displayName: string;
  role: string;
  primaryCapabilities: string[];  // Main expertise areas
  secondaryCapabilities: string[]; // Support/adjacent capabilities
  toolFilters: {
    preferred_executor_kinds: string[];
    blocked_tools: string[];
  };
}

export const SPHERE_CAPABILITIES: Record<SphereAgentId, SphereCapability> = {
  'synthia': {
    agentId: 'synthia',
    displayName: 'SYNTHIA™',
    role: 'Chief of Staff — Coordinadora General',
    primaryCapabilities: [
      'orchestration',
      'task_coordination',
      'workflow_management',
      'meeting_facilitation',
      'performance_metrics',
    ],
    secondaryCapabilities: [
      'analytics',
      'reporting',
      'strategic_planning',
      'agent_supervision',
    ],
    toolFilters: {
      preferred_executor_kinds: ['mcp_server', 'cli_script'],
      blocked_tools: [],
    },
  },

  'alex': {
    agentId: 'alex',
    displayName: 'ALEX™',
    role: 'Estratega Ejecutivo — Chief Advisor',
    primaryCapabilities: [
      'strategic_planning',
      'business_analysis',
      'competitive_intelligence',
      'market_research',
      'decision_support',
    ],
    secondaryCapabilities: [
      'analytics',
      'reporting',
      'content_strategy',
      'consulting',
    ],
    toolFilters: {
      preferred_executor_kinds: ['mcp_server', 'cli_script'],
      blocked_tools: [],
    },
  },

  'cazadora': {
    agentId: 'cazadora',
    displayName: 'CAZADORA™',
    role: 'Cazadora de Oportunidades — Prospect Hunter',
    primaryCapabilities: [
      'lead_generation',
      'prospecting',
      'market_scanning',
      'opportunity_identification',
      'data_enrichment',
    ],
    secondaryCapabilities: [
      'sales_intelligence',
      'crm',
      'email_outreach',
      'social_listening',
    ],
    toolFilters: {
      preferred_executor_kinds: ['mcp_server', 'cli_script'],
      blocked_tools: [],
    },
  },

  'forjadora': {
    agentId: 'forjadora',
    displayName: 'FORJADORA™',
    role: 'Arquitecta de Sistemas — Systems Builder',
    primaryCapabilities: [
      'infrastructure',
      'deployment',
      'code_generation',
      'system_architecture',
      'ci_cd',
    ],
    secondaryCapabilities: [
      'technical_planning',
      'debugging',
      'performance_optimization',
      'documentation',
    ],
    toolFilters: {
      preferred_executor_kinds: ['mcp_server', 'cli_script', 'rust_provider'],
      blocked_tools: [],
    },
  },

  'seductora': {
    agentId: 'seductora',
    displayName: 'SEDUCTORA™',
    role: 'Closera Maestra — Sales & Persuasion',
    primaryCapabilities: [
      'sales',
      'negotiation',
      'client_relationship',
      'proposal_generation',
      'crm',
    ],
    secondaryCapabilities: [
      'email_marketing',
      'communication',
      'objection_handling',
      'deal_closing',
    ],
    toolFilters: {
      preferred_executor_kinds: ['mcp_server', 'cli_script'],
      blocked_tools: [],
    },
  },

  'consejo': {
    agentId: 'consejo',
    displayName: 'CONSEJO™',
    role: 'Consejero Mayor — Council Facilitator',
    primaryCapabilities: [
      'meeting_facilitation',
      'conflict_resolution',
      'consensus_building',
      'communication_coordination',
      'decision_support',
    ],
    secondaryCapabilities: [
      'mediation',
      'documentation',
      'knowledge_sharing',
      'team_alignment',
    ],
    toolFilters: {
      preferred_executor_kinds: ['mcp_server', 'cli_script'],
      blocked_tools: [],
    },
  },

  'dr-economia': {
    agentId: 'dr-economia',
    displayName: 'DR. ECONOMÍA',
    role: 'Analista Financiero — Arbitrage & Finance',
    primaryCapabilities: [
      'financial_analysis',
      'revenue_tracking',
      'payment_processing',
      'arbitrage',
      'pricing_optimization',
    ],
    secondaryCapabilities: [
      'analytics',
      'forecasting',
      'risk_assessment',
      'market_data',
    ],
    toolFilters: {
      preferred_executor_kinds: ['mcp_server', 'cli_script', 'http_api'],
      blocked_tools: [],
    },
  },

  'dra-cultura': {
    agentId: 'dra-cultura',
    displayName: 'DRA. CULTURA',
    role: 'Estratega Cultural — Content & CDMX Community',
    primaryCapabilities: [
      'content_creation',
      'social_media',
      'community_engagement',
      'cultural_strategy',
      'storytelling',
    ],
    secondaryCapabilities: [
      'brand_strategy',
      'design_coordination',
      'video_production',
      'audience_building',
    ],
    toolFilters: {
      preferred_executor_kinds: ['mcp_server', 'cli_script', 'cli_anything'],
      blocked_tools: [],
    },
  },

  'ing-teknos': {
    agentId: 'ing-teknos',
    displayName: 'ING. TEKNOS',
    role: 'Ingeniero de Sistemas — Tech Architecture',
    primaryCapabilities: [
      'system_architecture',
      'technical_planning',
      'infrastructure',
      'security',
      'performance_optimization',
    ],
    secondaryCapabilities: [
      'code_review',
      'testing',
      'monitoring',
      'troubleshooting',
    ],
    toolFilters: {
      preferred_executor_kinds: ['mcp_server', 'cli_script', 'rust_provider'],
      blocked_tools: [],
    },
  },
};

/**
 * Get all capabilities available to a specific agent
 */
export function getAgentCapabilities(agentId: SphereAgentId): string[] {
  const cap = SPHERE_CAPABILITIES[agentId];
  return [...cap.primaryCapabilities, ...cap.secondaryCapabilities];
}

/**
 * Find agents that can handle a specific capability
 */
export function findAgentsByCapability(capability: string): SphereAgentId[] {
  return Object.entries(SPHERE_CAPABILITIES)
    .filter(([_, cap]) =>
      cap.primaryCapabilities.includes(capability) ||
      cap.secondaryCapabilities.includes(capability)
    )
    .map(([id]) => id as SphereAgentId);
}

/**
 * Check if an agent can use a tool based on executor kind
 */
export function canAgentUseTool(agentId: SphereAgentId, executorKind: string): boolean {
  const cap = SPHERE_CAPABILITIES[agentId];
  return cap.toolFilters.preferred_executor_kinds.includes(executorKind) &&
         !cap.toolFilters.blocked_tools.includes(executorKind);
}

/**
 * Get recommended agents for a task based on required capabilities
 */
export function findAgentsForTask(requiredCapabilities: string[]): Array<{
  agentId: SphereAgentId;
  matchScore: number;
  primaryMatches: string[];
  secondaryMatches: string[];
}> {
  const results: Array<{
    agentId: SphereAgentId;
    matchScore: number;
    primaryMatches: string[];
    secondaryMatches: string[];
  }> = [];

  for (const [agentId, cap] of Object.entries(SPHERE_CAPABILITIES)) {
    const primaryMatches = requiredCapabilities.filter(c =>
      cap.primaryCapabilities.includes(c)
    );
    const secondaryMatches = requiredCapabilities.filter(c =>
      cap.secondaryCapabilities.includes(c) && !primaryMatches.includes(c)
    );

    if (primaryMatches.length > 0 || secondaryMatches.length > 0) {
      const matchScore =
        (primaryMatches.length * 1.0 + secondaryMatches.length * 0.5) /
        requiredCapabilities.length;

      results.push({
        agentId: agentId as SphereAgentId,
        matchScore,
        primaryMatches,
        secondaryMatches,
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
