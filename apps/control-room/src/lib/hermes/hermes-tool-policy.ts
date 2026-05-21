/**
 * Hermes Tool Policy Engine
 * Controls which tools are available per role.
 * Dangerous tools are disabled by default and require explicit env flags + admin role.
 */

import type { HermesRiskLevel } from './hermes-types';

export type UserRole = 'admin' | 'operator' | 'user' | 'anonymous';

interface ToolPolicy {
  allowed_roles: UserRole[];
  requires_env?: string;
  risk_level: HermesRiskLevel;
}

const TOOL_POLICIES: Record<string, ToolPolicy> = {
  // Safe — any authenticated user
  'web-search':    { allowed_roles: ['admin', 'operator', 'user'], risk_level: 'low' },
  'document-read': { allowed_roles: ['admin', 'operator', 'user'], risk_level: 'low' },
  'spreadsheet':   { allowed_roles: ['admin', 'operator', 'user'], risk_level: 'low' },
  'transcribe':    { allowed_roles: ['admin', 'operator', 'user'], risk_level: 'low' },
  'calendar':      { allowed_roles: ['admin', 'operator', 'user'], risk_level: 'low' },
  'maps':          { allowed_roles: ['admin', 'operator', 'user'], risk_level: 'low' },
  'image-gen':     { allowed_roles: ['admin', 'operator', 'user'], risk_level: 'low' },

  // Medium — operator or admin
  'browser':       { allowed_roles: ['admin', 'operator'], risk_level: 'medium' },
  'video-gen':     { allowed_roles: ['admin', 'operator'], risk_level: 'medium' },
  'slides':        { allowed_roles: ['admin', 'operator'], risk_level: 'medium' },
  'email-send':    { allowed_roles: ['admin', 'operator'], risk_level: 'medium' },
  'whatsapp':      { allowed_roles: ['admin', 'operator'], requires_env: 'WHATSAPP_TOKEN', risk_level: 'medium' },
  'avatar':        { allowed_roles: ['admin', 'operator'], risk_level: 'medium' },

  // High/Critical — admin only + env flag
  'code-exec':     { allowed_roles: ['admin'], requires_env: 'HERMES_ENABLE_SHELL', risk_level: 'high' },
  'shell':         { allowed_roles: ['admin'], requires_env: 'HERMES_ENABLE_SHELL', risk_level: 'critical' },
  'full_vm':       { allowed_roles: ['admin'], requires_env: 'HERMES_ENABLE_SHELL', risk_level: 'critical' },
};

export function canUseTool(toolId: string, role: UserRole): { allowed: boolean; reason?: string } {
  const policy = TOOL_POLICIES[toolId];
  if (!policy) {
    return { allowed: false, reason: `Unknown tool: ${toolId}` };
  }

  if (!policy.allowed_roles.includes(role)) {
    return { allowed: false, reason: `Tool "${toolId}" requires role: ${policy.allowed_roles.join(' or ')}` };
  }

  if (policy.requires_env && !process.env[policy.requires_env]) {
    return { allowed: false, reason: `Tool "${toolId}" requires env var ${policy.requires_env} to be set` };
  }

  return { allowed: true };
}

export function filterToolsForRole(toolIds: string[], role: UserRole): string[] {
  return toolIds.filter(id => canUseTool(id, role).allowed);
}

export function getToolRiskLevel(toolId: string): HermesRiskLevel {
  return TOOL_POLICIES[toolId]?.risk_level ?? 'low';
}

export function listAllPolicies(): Record<string, ToolPolicy> {
  return { ...TOOL_POLICIES };
}
