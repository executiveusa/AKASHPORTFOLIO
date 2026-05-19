/**
 * es-MX locale — default locale for Synthia Control Room.
 */
const esMX = {
  locale: 'es-MX',
  // Navigation
  dashboard: 'Estado de la agencia',
  agents: 'Agentes activos',
  workflows: 'Flujos de trabajo',
  approvals: 'Aprobaciones pendientes',
  latestRuns: 'Últimas ejecuciones',
  alerts: 'Alertas',
  estimatedCosts: 'Costos estimados',
  integrations: 'Integraciones',
  observability: 'Observabilidad',
  settings: 'Configuración',
  // Integrations
  openDify: 'Abrir Dify',
  openLangfuse: 'Abrir Langfuse',
  openWebUI: 'Abrir Open WebUI',
  // Auth
  signIn: 'Iniciar sesión',
  signOut: 'Cerrar sesión',
  signInWith: 'Iniciar sesión con',
  signInGoogle: 'Continuar con Google',
  authError: 'Error de autenticación',
  unauthorized: 'No autorizado',
  forbidden: 'Acceso denegado',
  // Workflows
  launchWorkflow: 'Lanzar flujo',
  workflowNotFound: 'Flujo no encontrado',
  workflowBlocked: 'Flujo bloqueado por política de seguridad',
  workflowBlockedSideEffects: 'Efectos externos deshabilitados. Configure DISABLE_EXTERNAL_SIDE_EFFECTS=false.',
  workflowDryRun: 'Simulación (sin efectos externos)',
  workflowHighRisk: 'Flujo de alto riesgo — requiere aprobación y rol admin',
  workflowApprovalRequired: 'Se requiere aprobación para este flujo',
  // Approvals
  approvalPending: 'Pendiente de aprobación',
  approvalApproved: 'Aprobado',
  approvalRejected: 'Rechazado',
  approvalExpired: 'Aprobación vencida',
  approvalHighRisk: 'Alto riesgo — solo admin puede decidir',
  approvalCreate: 'Solicitar aprobación',
  approvalDecide: 'Tomar decisión',
  // Errors
  internalError: 'Error interno del servidor',
  dbUnavailable: 'Base de datos no disponible',
  invalidInput: 'Entrada inválida',
  missingField: 'Campo requerido faltante',
  // Tool policy
  dangerousToolDisabled: 'Herramienta peligrosa deshabilitada (ENABLE_DANGEROUS_TOOLS=false)',
  toolNotAllowed: 'Herramienta no permitida',
  adminRequiredForTool: 'Se requiere rol admin para ejecutar esta herramienta',
  sideEffectsBlocked: 'Efectos secundarios externos bloqueados por política',
  // A2A
  a2aContract: 'Contrato interno inspirado en A2A (no cumplimiento total)',
  agentRegistered: 'Agente registrado',
  taskReportSubmitted: 'Reporte de tarea enviado',
};

export default esMX;
export type Locale = typeof esMX;
