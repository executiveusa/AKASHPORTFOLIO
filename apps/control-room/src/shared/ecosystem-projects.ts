/**
 * KUPURI Ecosystem Projects
 *
 * Complete catalog of all projects, services, and initiatives in the ecosystem.
 * Structured for dashboard display and agent discovery.
 */

export interface EcosystemProject {
  id: string;
  name: string;
  shortName: string;
  category: 'flagship' | 'platform' | 'service' | 'initiative';
  status: 'active' | 'beta' | 'coming_soon' | 'archived';
  description: string;
  imageUrl: string;
  url: string;
  tags: string[];
  impact?: string;
  team?: string[];
  metrics?: {
    users?: number;
    transactions?: number;
    satisfaction?: number;
  };
}

export const ECOSYSTEM_PROJECTS: EcosystemProject[] = [
  {
    id: 'synthia-3.0',
    name: 'Synthia 3.0',
    shortName: 'Synthia',
    category: 'flagship',
    status: 'active',
    description:
      'AI-powered control room orchestrating 172+ autonomous agents for collaborative problem solving. Multi-agent system with sphere agents (SYNTHIA, ALEX, CAZADORA, etc.) managing strategy, sales, operations, and culture.',
    imageUrl: '/images/projects/synthia.jpg',
    url: '/dashboard',
    tags: ['ai', 'agents', 'orchestration', 'automation', 'control-room'],
    impact: 'Central nervous system of KUPURI ecosystem',
    team: ['ing-teknos', 'forjadora', 'synthia'],
    metrics: {
      users: 50,
      transactions: 1200,
      satisfaction: 98,
    },
  },

  {
    id: 'openclaw-gateway',
    name: 'OpenClaw Gateway',
    shortName: 'OpenClaw',
    category: 'platform',
    status: 'active',
    description:
      'Multi-channel AI assistant enabling 24/7 presence across WhatsApp, Telegram, Slack, and Discord. Integrated with Synthia 3.0 for intelligent request routing and response generation.',
    imageUrl: '/images/projects/openclaw.jpg',
    url: '/contact',
    tags: ['messaging', 'ai', 'multi-channel', 'automation', 'integration'],
    impact: '24/7 customer presence across 4 major platforms',
    team: ['seductora', 'dra-cultura', 'ing-teknos'],
    metrics: {
      users: 300,
      transactions: 2500,
      satisfaction: 95,
    },
  },

  {
    id: 'nexus-cdmx',
    name: 'NEXUS CDMX',
    shortName: 'NEXUS',
    category: 'platform',
    status: 'active',
    description:
      'Event coordination platform connecting creative professionals with real-time collaboration tools. Enables seamless coordination of creative projects and community events in Mexico City.',
    imageUrl: '/images/projects/nexus.jpg',
    url: '/work',
    tags: ['events', 'collaboration', 'community', 'creative', 'coordination'],
    impact: 'Hub for creative professional networking',
    team: ['dra-cultura', 'consejo'],
    metrics: {
      users: 150,
      transactions: 45,
      satisfaction: 96,
    },
  },

  {
    id: 'suelta-app',
    name: 'Suelta App',
    shortName: 'Suelta',
    category: 'platform',
    status: 'active',
    description:
      'Mobile marketplace empowering creators to manage, collaborate, and monetize work directly. Provides tools for portfolio management, client communication, and payment processing.',
    imageUrl: '/images/projects/suelta.jpg',
    url: '/work',
    tags: ['marketplace', 'creators', 'mobile', 'payments', 'collaboration'],
    impact: 'Creator economy platform for independent professionals',
    team: ['seductora', 'dr-economia', 'ing-teknos'],
    metrics: {
      users: 200,
      transactions: 800,
      satisfaction: 94,
    },
  },

  {
    id: 'la-monarca',
    name: 'La Monarca',
    shortName: 'Monarca',
    category: 'initiative',
    status: 'beta',
    description:
      'Digital newspaper exploring transformation, identity, and the monarchy of creative thought. Platform for curated stories, cultural insights, and creative narratives.',
    imageUrl: '/images/projects/monarca.jpg',
    url: '/newspaper',
    tags: ['publishing', 'journalism', 'culture', 'storytelling', 'digital'],
    impact: 'Voice for creative and cultural thought leadership',
    team: ['dra-cultura', 'synthia'],
    metrics: {
      users: 100,
      transactions: 50,
      satisfaction: 97,
    },
  },

  {
    id: 'kupuri-studios',
    name: 'Kupuri Studios',
    shortName: 'Studios',
    category: 'flagship',
    status: 'active',
    description:
      'International creative studio specializing in digital experiences and brand storytelling. 100% women-led and operated, with 10+ years of international design expertise.',
    imageUrl: '/images/projects/studios.jpg',
    url: 'https://kupurimedia.com',
    tags: ['design', 'branding', 'digital', 'international', 'studio'],
    impact: 'Creative excellence and women leadership in tech',
    team: ['dra-cultura', 'forjadora'],
    metrics: {
      users: 25,
      transactions: 300,
      satisfaction: 99,
    },
  },

  {
    id: 'directory',
    name: 'Ecosystem Directory',
    shortName: 'Directory',
    category: 'service',
    status: 'active',
    description:
      'Comprehensive catalog of all KUPURI ecosystem projects, services, and resources. Navigation hub for discovering and accessing different parts of the ecosystem.',
    imageUrl: '/images/projects/directory.jpg',
    url: '/directory',
    tags: ['navigation', 'discovery', 'ecosystem', 'catalog'],
    impact: 'Central discovery point for ecosystem',
    team: ['synthia', 'consejo'],
  },

  {
    id: 'control-room',
    name: 'Control Room (Synthia Dashboard)',
    shortName: 'Control Room',
    category: 'service',
    status: 'active',
    description:
      'Real-time monitoring and control center for Synthia 3.0 agents. View agent status, recent activities, revenue metrics, and tool availability.',
    imageUrl: '/images/projects/control-room.jpg',
    url: '/control-room',
    tags: ['dashboard', 'monitoring', 'control', 'agents', 'analytics'],
    impact: 'Operational visibility and control hub',
    team: ['synthia', 'ing-teknos'],
  },

  {
    id: 'viewing-room',
    name: 'Viewing Room',
    shortName: 'Viewing',
    category: 'service',
    status: 'beta',
    description:
      'Interactive 3D showcase of creative projects with Unreal Engine-level graphics. PlayStation-like mobile UI for immersive project exploration.',
    imageUrl: '/images/projects/viewing-room.jpg',
    url: '/viewing-room',
    tags: ['3d', 'showcase', 'visualization', 'interactive', 'portfolio'],
    impact: 'Next-gen project presentation platform',
    team: ['dra-cultura', 'forjadora'],
  },
];

/**
 * Get all projects in a category
 */
export function getProjectsByCategory(
  category: EcosystemProject['category']
): EcosystemProject[] {
  return ECOSYSTEM_PROJECTS.filter(p => p.category === category);
}

/**
 * Get all active projects
 */
export function getActiveProjects(): EcosystemProject[] {
  return ECOSYSTEM_PROJECTS.filter(p => p.status === 'active');
}

/**
 * Search projects by name or tags
 */
export function searchProjects(query: string): EcosystemProject[] {
  const lower = query.toLowerCase();
  return ECOSYSTEM_PROJECTS.filter(p =>
    p.name.toLowerCase().includes(lower) ||
    p.description.toLowerCase().includes(lower) ||
    p.tags.some(t => t.toLowerCase().includes(lower))
  );
}

/**
 * Get projects for a specific sphere agent
 */
export function getProjectsForAgent(agentId: string): EcosystemProject[] {
  return ECOSYSTEM_PROJECTS.filter(p => p.team?.includes(agentId));
}

/**
 * Get statistics about ecosystem projects
 */
export function getEcosystemStats() {
  const active = ECOSYSTEM_PROJECTS.filter(p => p.status === 'active').length;
  const beta = ECOSYSTEM_PROJECTS.filter(p => p.status === 'beta').length;
  const comingSoon = ECOSYSTEM_PROJECTS.filter(
    p => p.status === 'coming_soon'
  ).length;

  return {
    total: ECOSYSTEM_PROJECTS.length,
    active,
    beta,
    coming_soon: comingSoon,
    by_category: {
      flagship: getProjectsByCategory('flagship').length,
      platform: getProjectsByCategory('platform').length,
      service: getProjectsByCategory('service').length,
      initiative: getProjectsByCategory('initiative').length,
    },
  };
}
