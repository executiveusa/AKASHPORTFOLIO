/**
 * Tool-Sphere Assignments
 *
 * Maps marketing tools to sphere agents that can use them effectively.
 * Each tool is assigned based on:
 * 1. Primary agent: Best suited for the tool
 * 2. Secondary agents: Can use the tool in support roles
 */

import type { SphereAgentId } from './council-events';

export interface ToolAssignment {
  tool_id: string;
  tool_name: string;
  category: string;
  primary_agent: SphereAgentId;
  secondary_agents: SphereAgentId[];
  capabilities_enabled: string[];
}

export const TOOL_SPHERE_ASSIGNMENTS: Record<string, ToolAssignment> = {
  // ===== ANALYTICS TOOLS =====
  'ga4': {
    tool_id: 'ga4',
    tool_name: 'Google Analytics 4',
    category: 'analytics',
    primary_agent: 'dr-economia',
    secondary_agents: ['synthia', 'alex'],
    capabilities_enabled: ['analytics', 'reporting', 'performance_metrics'],
  },
  'mixpanel': {
    tool_id: 'mixpanel',
    tool_name: 'Mixpanel',
    category: 'analytics',
    primary_agent: 'dr-economia',
    secondary_agents: ['synthia', 'alex'],
    capabilities_enabled: ['analytics', 'product_analytics', 'funnels'],
  },
  'amplitude': {
    tool_id: 'amplitude',
    tool_name: 'Amplitude',
    category: 'analytics',
    primary_agent: 'dr-economia',
    secondary_agents: ['synthia', 'alex'],
    capabilities_enabled: ['analytics', 'product_analytics', 'user_behavior'],
  },
  'segment': {
    tool_id: 'segment',
    tool_name: 'Segment',
    category: 'analytics',
    primary_agent: 'ing-teknos',
    secondary_agents: ['forjadora', 'dr-economia'],
    capabilities_enabled: ['analytics', 'data_pipeline', 'tracking'],
  },
  'hotjar': {
    tool_id: 'hotjar',
    tool_name: 'Hotjar',
    category: 'analytics',
    primary_agent: 'dra-cultura',
    secondary_agents: ['dr-economia', 'alex'],
    capabilities_enabled: ['analytics', 'heatmaps', 'user_behavior'],
  },

  // ===== SEO TOOLS =====
  'google-search-console': {
    tool_id: 'google-search-console',
    tool_name: 'Google Search Console',
    category: 'seo',
    primary_agent: 'dra-cultura',
    secondary_agents: ['cazadora', 'alex'],
    capabilities_enabled: ['seo', 'keyword_research', 'reporting'],
  },
  'semrush': {
    tool_id: 'semrush',
    tool_name: 'Semrush',
    category: 'seo',
    primary_agent: 'cazadora',
    secondary_agents: ['dra-cultura', 'alex'],
    capabilities_enabled: ['seo', 'keyword_research', 'competitor_analysis'],
  },
  'ahrefs': {
    tool_id: 'ahrefs',
    tool_name: 'Ahrefs',
    category: 'seo',
    primary_agent: 'cazadora',
    secondary_agents: ['dra-cultura', 'alex'],
    capabilities_enabled: ['seo', 'backlinks', 'keyword_research'],
  },
  'dataforseo': {
    tool_id: 'dataforseo',
    tool_name: 'DataForSEO',
    category: 'seo',
    primary_agent: 'dr-economia',
    secondary_agents: ['cazadora', 'alex'],
    capabilities_enabled: ['seo', 'keyword_research', 'rank_tracking'],
  },

  // ===== DATA ENRICHMENT / LEAD GENERATION =====
  'clearbit': {
    tool_id: 'clearbit',
    tool_name: 'Clearbit',
    category: 'data_enrichment',
    primary_agent: 'cazadora',
    secondary_agents: ['seductora', 'synthia'],
    capabilities_enabled: ['data_enrichment', 'lead_generation', 'crm'],
  },
  'apollo': {
    tool_id: 'apollo',
    tool_name: 'Apollo',
    category: 'data_enrichment',
    primary_agent: 'cazadora',
    secondary_agents: ['seductora', 'alex'],
    capabilities_enabled: ['sales_intelligence', 'prospecting', 'lead_generation'],
  },
  'hunter': {
    tool_id: 'hunter',
    tool_name: 'Hunter',
    category: 'email_outreach',
    primary_agent: 'cazadora',
    secondary_agents: ['seductora'],
    capabilities_enabled: ['email_outreach', 'lead_generation'],
  },

  // ===== CRM / SALES =====
  'hubspot': {
    tool_id: 'hubspot',
    tool_name: 'HubSpot',
    category: 'crm',
    primary_agent: 'seductora',
    secondary_agents: ['cazadora', 'synthia'],
    capabilities_enabled: ['crm', 'sales', 'marketing_automation', 'email_marketing'],
  },
  'salesforce': {
    tool_id: 'salesforce',
    tool_name: 'Salesforce',
    category: 'crm',
    primary_agent: 'seductora',
    secondary_agents: ['cazadora', 'synthia'],
    capabilities_enabled: ['crm', 'sales', 'customer_management'],
  },
  'intercom': {
    tool_id: 'intercom',
    tool_name: 'Intercom',
    category: 'messaging',
    primary_agent: 'seductora',
    secondary_agents: ['dra-cultura', 'consejo'],
    capabilities_enabled: ['messaging', 'customer_support', 'user_engagement'],
  },

  // ===== EMAIL MARKETING / NEWSLETTERS =====
  'mailchimp': {
    tool_id: 'mailchimp',
    tool_name: 'Mailchimp',
    category: 'email',
    primary_agent: 'dra-cultura',
    secondary_agents: ['seductora', 'dr-economia'],
    capabilities_enabled: ['email_marketing', 'newsletters', 'automation'],
  },
  'sendgrid': {
    tool_id: 'sendgrid',
    tool_name: 'SendGrid',
    category: 'email',
    primary_agent: 'dra-cultura',
    secondary_agents: ['seductora'],
    capabilities_enabled: ['email', 'transactional_email', 'marketing_email'],
  },
  'resend': {
    tool_id: 'resend',
    tool_name: 'Resend',
    category: 'email',
    primary_agent: 'ing-teknos',
    secondary_agents: ['dra-cultura', 'forjadora'],
    capabilities_enabled: ['email', 'transactional_email', 'api'],
  },
  'klaviyo': {
    tool_id: 'klaviyo',
    tool_name: 'Klaviyo',
    category: 'email',
    primary_agent: 'dra-cultura',
    secondary_agents: ['seductora', 'dr-economia'],
    capabilities_enabled: ['email_marketing', 'sms', 'ecommerce'],
  },
  'beehiiv': {
    tool_id: 'beehiiv',
    tool_name: 'Beehiiv',
    category: 'newsletter',
    primary_agent: 'dra-cultura',
    secondary_agents: ['synthia'],
    capabilities_enabled: ['newsletter', 'email_marketing', 'subscriptions'],
  },
  'activecampaign': {
    tool_id: 'activecampaign',
    tool_name: 'ActiveCampaign',
    category: 'email',
    primary_agent: 'seductora',
    secondary_agents: ['dra-cultura', 'dr-economia'],
    capabilities_enabled: ['email_marketing', 'crm', 'marketing_automation'],
  },
  'brevo': {
    tool_id: 'brevo',
    tool_name: 'Brevo (Sendinblue)',
    category: 'email',
    primary_agent: 'dra-cultura',
    secondary_agents: ['seductora'],
    capabilities_enabled: ['email', 'sms', 'marketing_automation'],
  },

  // ===== ADVERTISING =====
  'google-ads': {
    tool_id: 'google-ads',
    tool_name: 'Google Ads',
    category: 'ads',
    primary_agent: 'dr-economia',
    secondary_agents: ['cazadora', 'dra-cultura'],
    capabilities_enabled: ['paid_ads', 'google', 'search_advertising'],
  },
  'meta-ads': {
    tool_id: 'meta-ads',
    tool_name: 'Meta Ads (Facebook/Instagram)',
    category: 'ads',
    primary_agent: 'dra-cultura',
    secondary_agents: ['dr-economia', 'cazadora'],
    capabilities_enabled: ['paid_ads', 'facebook', 'instagram', 'social_advertising'],
  },
  'linkedin-ads': {
    tool_id: 'linkedin-ads',
    tool_name: 'LinkedIn Ads',
    category: 'ads',
    primary_agent: 'cazadora',
    secondary_agents: ['dr-economia', 'dra-cultura'],
    capabilities_enabled: ['paid_ads', 'linkedin', 'b2b_advertising'],
  },
  'tiktok-ads': {
    tool_id: 'tiktok-ads',
    tool_name: 'TikTok Ads',
    category: 'ads',
    primary_agent: 'dra-cultura',
    secondary_agents: ['cazadora', 'dr-economia'],
    capabilities_enabled: ['paid_ads', 'tiktok', 'video_advertising'],
  },

  // ===== PAYMENTS =====
  'stripe': {
    tool_id: 'stripe',
    tool_name: 'Stripe',
    category: 'payments',
    primary_agent: 'dr-economia',
    secondary_agents: ['forjadora', 'ing-teknos'],
    capabilities_enabled: ['payments', 'billing', 'subscriptions'],
  },
  'paddle': {
    tool_id: 'paddle',
    tool_name: 'Paddle',
    category: 'payments',
    primary_agent: 'dr-economia',
    secondary_agents: ['seductora'],
    capabilities_enabled: ['payments', 'billing', 'subscriptions'],
  },

  // ===== REFERRAL / AFFILIATE =====
  'rewardful': {
    tool_id: 'rewardful',
    tool_name: 'Rewardful',
    category: 'referral',
    primary_agent: 'seductora',
    secondary_agents: ['dr-economia', 'cazadora'],
    capabilities_enabled: ['referral', 'affiliate', 'commissions'],
  },
  'partnerstack': {
    tool_id: 'partnerstack',
    tool_name: 'PartnerStack',
    category: 'affiliate',
    primary_agent: 'seductora',
    secondary_agents: ['cazadora', 'alex'],
    capabilities_enabled: ['affiliate', 'partner_management', 'referrals'],
  },

  // ===== LINK MANAGEMENT =====
  'dub': {
    tool_id: 'dub',
    tool_name: 'Dub.co',
    category: 'links',
    primary_agent: 'dra-cultura',
    secondary_agents: ['dr-economia'],
    capabilities_enabled: ['link_management', 'analytics', 'tracking'],
  },

  // ===== SCHEDULING =====
  'calendly': {
    tool_id: 'calendly',
    tool_name: 'Calendly',
    category: 'scheduling',
    primary_agent: 'consejo',
    secondary_agents: ['seductora', 'synthia'],
    capabilities_enabled: ['scheduling', 'calendar', 'meeting_coordination'],
  },
  'savvycal': {
    tool_id: 'savvycal',
    tool_name: 'Savvycal',
    category: 'scheduling',
    primary_agent: 'consejo',
    secondary_agents: ['synthia'],
    capabilities_enabled: ['scheduling', 'calendar', 'group_scheduling'],
  },

  // ===== SOCIAL MEDIA =====
  'buffer': {
    tool_id: 'buffer',
    tool_name: 'Buffer',
    category: 'social',
    primary_agent: 'dra-cultura',
    secondary_agents: ['synthia'],
    capabilities_enabled: ['social_media', 'scheduling', 'content_publishing'],
  },

  // ===== FORMS / SURVEYS =====
  'typeform': {
    tool_id: 'typeform',
    tool_name: 'Typeform',
    category: 'forms',
    primary_agent: 'dra-cultura',
    secondary_agents: ['cazadora'],
    capabilities_enabled: ['forms', 'surveys', 'lead_generation'],
  },

  // ===== WEBINARS =====
  'demio': {
    tool_id: 'demio',
    tool_name: 'Demio',
    category: 'webinar',
    primary_agent: 'dra-cultura',
    secondary_agents: ['synthia', 'consejo'],
    capabilities_enabled: ['webinars', 'video_events', 'engagement'],
  },

  // ===== REVIEWS =====
  'trustpilot': {
    tool_id: 'trustpilot',
    tool_name: 'Trustpilot',
    category: 'reviews',
    primary_agent: 'dra-cultura',
    secondary_agents: ['alex', 'seductora'],
    capabilities_enabled: ['reviews', 'reputation', 'feedback'],
  },
  'g2': {
    tool_id: 'g2',
    tool_name: 'G2',
    category: 'reviews',
    primary_agent: 'cazadora',
    secondary_agents: ['alex', 'dra-cultura'],
    capabilities_enabled: ['reviews', 'competitive_analysis', 'market_research'],
  },

  // ===== CMS / COMMERCE =====
  'shopify': {
    tool_id: 'shopify',
    tool_name: 'Shopify',
    category: 'commerce',
    primary_agent: 'dr-economia',
    secondary_agents: ['ing-teknos', 'dra-cultura'],
    capabilities_enabled: ['ecommerce', 'storefronts', 'sales'],
  },
  'wordpress': {
    tool_id: 'wordpress',
    tool_name: 'WordPress',
    category: 'cms',
    primary_agent: 'dra-cultura',
    secondary_agents: ['ing-teknos', 'forjadora'],
    capabilities_enabled: ['cms', 'content_management', 'blogging'],
  },
  'webflow': {
    tool_id: 'webflow',
    tool_name: 'Webflow',
    category: 'cms',
    primary_agent: 'ing-teknos',
    secondary_agents: ['dra-cultura', 'forjadora'],
    capabilities_enabled: ['cms', 'web_design', 'hosting'],
  },

  // ===== AUTOMATION =====
  'zapier': {
    tool_id: 'zapier',
    tool_name: 'Zapier',
    category: 'automation',
    primary_agent: 'forjadora',
    secondary_agents: ['ing-teknos', 'synthia'],
    capabilities_enabled: ['automation', 'integrations', 'workflows'],
  },

  // ===== NOTIFICATIONS =====
  'onesignal': {
    tool_id: 'onesignal',
    tool_name: 'OneSignal',
    category: 'push',
    primary_agent: 'dra-cultura',
    secondary_agents: ['seductora'],
    capabilities_enabled: ['push_notifications', 'messaging', 'engagement'],
  },

  // ===== VIDEO =====
  'wistia': {
    tool_id: 'wistia',
    tool_name: 'Wistia',
    category: 'video',
    primary_agent: 'dra-cultura',
    secondary_agents: ['synthia'],
    capabilities_enabled: ['video', 'hosting', 'analytics'],
  },

  // ===== TESTING / OPTIMIZATION =====
  'optimizely': {
    tool_id: 'optimizely',
    tool_name: 'Optimizely',
    category: 'testing',
    primary_agent: 'dr-economia',
    secondary_agents: ['ing-teknos'],
    capabilities_enabled: ['ab_testing', 'conversion_optimization', 'experimentation'],
  },
};

/**
 * Get all tools available for a sphere agent
 */
export function getToolsForAgent(agentId: SphereAgentId): ToolAssignment[] {
  return Object.values(TOOL_SPHERE_ASSIGNMENTS).filter(
    assignment =>
      assignment.primary_agent === agentId ||
      assignment.secondary_agents.includes(agentId)
  );
}

/**
 * Get the primary agent for a tool
 */
export function getPrimaryAgentForTool(toolId: string): SphereAgentId | null {
  return TOOL_SPHERE_ASSIGNMENTS[toolId]?.primary_agent ?? null;
}

/**
 * Get all agents that can use a tool
 */
export function getAgentsForTool(toolId: string): SphereAgentId[] {
  const assignment = TOOL_SPHERE_ASSIGNMENTS[toolId];
  if (!assignment) return [];
  return [assignment.primary_agent, ...assignment.secondary_agents];
}

/**
 * Count tools by category
 */
export function countToolsByCategory(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const assignment of Object.values(TOOL_SPHERE_ASSIGNMENTS)) {
    counts[assignment.category] = (counts[assignment.category] ?? 0) + 1;
  }
  return counts;
}
