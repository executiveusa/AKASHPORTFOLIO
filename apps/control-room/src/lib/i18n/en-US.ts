/**
 * en-US locale — fallback locale for Synthia Control Room.
 */
import type { Locale } from './es-MX';

const enUS: Locale = {
  locale: 'en-US',
  // Navigation
  dashboard: 'Agency Status',
  agents: 'Active Agents',
  workflows: 'Workflows',
  approvals: 'Pending Approvals',
  latestRuns: 'Latest Runs',
  alerts: 'Alerts',
  estimatedCosts: 'Estimated Costs',
  integrations: 'Integrations',
  observability: 'Observability',
  settings: 'Settings',
  // Integrations
  openDify: 'Open Dify',
  openLangfuse: 'Open Langfuse',
  openWebUI: 'Open Web UI',
  // Auth
  signIn: 'Sign In',
  signOut: 'Sign Out',
  signInWith: 'Sign in with',
  signInGoogle: 'Continue with Google',
  authError: 'Authentication error',
  unauthorized: 'Unauthorized',
  forbidden: 'Access denied',
  // Workflows
  launchWorkflow: 'Launch workflow',
  workflowNotFound: 'Workflow not found',
  workflowBlocked: 'Workflow blocked by security policy',
  workflowBlockedSideEffects: 'External side effects disabled. Set DISABLE_EXTERNAL_SIDE_EFFECTS=false.',
  workflowDryRun: 'Dry run (no external effects)',
  workflowHighRisk: 'High-risk workflow — requires approval and admin role',
  workflowApprovalRequired: 'Approval required for this workflow',
  // Approvals
  approvalPending: 'Pending approval',
  approvalApproved: 'Approved',
  approvalRejected: 'Rejected',
  approvalExpired: 'Approval expired',
  approvalHighRisk: 'High risk — admin-only decision',
  approvalCreate: 'Request approval',
  approvalDecide: 'Make decision',
  // Errors
  internalError: 'Internal server error',
  dbUnavailable: 'Database unavailable',
  invalidInput: 'Invalid input',
  missingField: 'Required field missing',
  // Tool policy
  dangerousToolDisabled: 'Dangerous tool disabled (ENABLE_DANGEROUS_TOOLS=false)',
  toolNotAllowed: 'Tool not allowed',
  adminRequiredForTool: 'Admin role required to execute this tool',
  sideEffectsBlocked: 'External side effects blocked by policy',
  // A2A
  a2aContract: 'A2A-inspired internal contract (not full compliance)',
  agentRegistered: 'Agent registered',
  taskReportSubmitted: 'Task report submitted',
};

export default enUS;
