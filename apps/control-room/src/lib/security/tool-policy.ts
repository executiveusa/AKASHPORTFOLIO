export const ENABLE_DANGEROUS_TOOLS = (process.env.ENABLE_DANGEROUS_TOOLS || 'false') === 'true';
export const DISABLE_EXTERNAL_SIDE_EFFECTS = (process.env.DISABLE_EXTERNAL_SIDE_EFFECTS || 'true') === 'true';
export const TOOL_ALLOWLIST = (process.env.TOOL_ALLOWLIST || 'read,status,search').split(',').map(s=>s.trim()).filter(Boolean);
const DANGEROUS = ['shell','write','deploy','social','email','payment'];
export function isDangerousTool(toolName: string) { return DANGEROUS.some(d => toolName.toLowerCase().includes(d)); }
export function assertDangerousToolsEnabled() { if (!ENABLE_DANGEROUS_TOOLS) throw new Error('DANGEROUS_TOOLS_DISABLED'); }
export function assertToolAllowed(toolName: string, userRole: string) {
  if (isDangerousTool(toolName)) { assertDangerousToolsEnabled(); if (userRole !== 'admin') throw new Error('ADMIN_REQUIRED'); }
  if (!TOOL_ALLOWLIST.includes(toolName)) throw new Error('TOOL_NOT_ALLOWLISTED');
}
export function auditToolInvocation(toolName: string, userRole: string) { return { toolName, userRole, dangerous: isDangerousTool(toolName), at: new Date().toISOString() }; }
