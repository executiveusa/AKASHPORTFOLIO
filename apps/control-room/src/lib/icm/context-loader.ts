/**
 * ICM — Interpreted Context Methodology
 * Layer 2: Stage-specific context contracts.
 *
 * Each module defines:
 *   - what SYNTHIA should know when responding in that context
 *   - what tools/actions are available to the agent
 *   - what the user's primary goal is in this module
 *
 * ICM principle: agents read only the context they need for the current stage —
 * 2,000–4,000 tokens max per context, never a monolithic system prompt.
 */

export type ICMStage = "dashboard" | "panorama" | "chat" | "casos" | "cockpit" | "project" | "risks" | "expenses" | "equipo";

export interface ICMContext {
  stage: ICMStage;
  roleInstruction: string;       // What SYNTHIA is in this context
  userGoal: string;              // What the user is trying to do
  availableActions: string[];    // Tools SYNTHIA can invoke here
  quickChips: { label: string; prompt: string }[];  // Suggestion chips for the UI
  confidenceThreshold: number;   // Minimum confidence to auto-execute (ICM quality gate)
}

// ICM Layer 3: canonical context definitions (reference material)
const CONTEXTS: Record<ICMStage, ICMContext> = {
  dashboard: {
    stage: "dashboard",
    roleInstruction:
      "Eres la vista general del sistema. El usuario quiere un resumen rápido del estado operativo. Responde con información concreta sobre agentes, tareas pendientes y alertas.",
    userGoal: "Ver estado del sistema y tomar decisiones rápidas del día.",
    availableActions: ["navigate", "create_task", "get_summary", "start_council"],
    quickChips: [
      { label: "Resumen del día", prompt: "¿Qué pasó hoy en el sistema?" },
      { label: "Agentes activos", prompt: "¿Qué agentes están activos ahora?" },
      { label: "Tareas urgentes", prompt: "¿Qué tareas necesitan atención urgente?" },
    ],
    confidenceThreshold: 0.75,
  },
  panorama: {
    stage: "panorama",
    roleInstruction:
      "Eres gestora de proyectos PMBOK 7. El usuario gestiona proyectos en 4 fases: Iniciación, Planificación, Ejecución y Cierre. Ayuda a mover proyectos, identificar riesgos y tomar decisiones de stewardship.",
    userGoal: "Gestionar el portafolio de proyectos y avanzar las fases PMBOK.",
    availableActions: ["create_project", "move_phase", "add_risk", "assign_role", "navigate"],
    quickChips: [
      { label: "+ Nuevo proyecto", prompt: "Crear un nuevo proyecto" },
      { label: "Ver riesgos", prompt: "¿Cuáles son los riesgos activos de mis proyectos?" },
      { label: "Estado PMBOK", prompt: "Resume el estado de cada fase PMBOK en mi portafolio" },
      { label: "Próxima acción", prompt: "¿Qué debo hacer primero hoy en mis proyectos?" },
    ],
    confidenceThreshold: 0.80,
  },
  chat: {
    stage: "chat",
    roleInstruction:
      "Eres SYNTHIA, asistente CEO invisible de Kupuri Media. Puedes crear tareas, analizar proyectos, revisar gastos, navegar al cockpit, coordinar al consejo de esferas o responder preguntas sobre el negocio.",
    userGoal: "Hablar con SYNTHIA para delegar trabajo o obtener análisis.",
    availableActions: ["create_task", "create_issue", "create_goal", "navigate", "start_council", "get_summary"],
    quickChips: [
      { label: "Delegar tarea", prompt: "Necesito delegar una tarea" },
      { label: "Análisis rápido", prompt: "Analiza el estado de mi negocio hoy" },
      { label: "Consejo de esferas", prompt: "Quiero una reunión del consejo de esferas" },
    ],
    confidenceThreshold: 0.70,
  },
  casos: {
    stage: "casos",
    roleInstruction:
      "Eres guía de casos de uso de SYNTHIA. El usuario explora qué puede hacer el sistema. Ayuda a encontrar el caso más relevante para sus necesidades.",
    userGoal: "Descubrir capacidades del sistema mediante casos reales.",
    availableActions: ["navigate", "create_task"],
    quickChips: [
      { label: "Casos de finanzas", prompt: "Muéstrame los casos relacionados con finanzas" },
      { label: "Casos de proyectos", prompt: "¿Qué casos de proyectos tienes?" },
    ],
    confidenceThreshold: 0.65,
  },
  cockpit: {
    stage: "cockpit",
    roleInstruction:
      "Eres la sala de control operativo. El usuario monitorea agentes, ingresos, alertas y reuniones del consejo. Responde con datos técnicos y operativos precisos.",
    userGoal: "Monitorear y controlar la operación del sistema agéntico.",
    availableActions: ["start_council", "get_agent_status", "navigate", "trigger_alert"],
    quickChips: [
      { label: "Iniciar consejo", prompt: "Inicia una reunión del consejo de esferas" },
      { label: "Estado de agentes", prompt: "¿Cuál es el estado de todos los agentes?" },
      { label: "Revenue hoy", prompt: "¿Cuánto revenue hay hoy?" },
    ],
    confidenceThreshold: 0.80,
  },
  project: {
    stage: "project",
    roleInstruction:
      "Eres gestora de un proyecto específico. Ayuda con el avance de fases, identificación de bloqueadores, actualización de tareas y comunicación con el equipo.",
    userGoal: "Gestionar y avanzar un proyecto específico.",
    availableActions: ["update_project", "add_task", "add_risk", "move_phase", "navigate"],
    quickChips: [
      { label: "Avanzar fase", prompt: "¿Puedo avanzar este proyecto a la siguiente fase PMBOK?" },
      { label: "Agregar tarea", prompt: "Agregar una nueva tarea a este proyecto" },
      { label: "Ver riesgos", prompt: "¿Cuáles son los riesgos de este proyecto?" },
    ],
    confidenceThreshold: 0.80,
  },
  risks: {
    stage: "risks",
    roleInstruction:
      "Eres gestora de riesgos PMBOK. Ayuda a identificar, evaluar y mitigar riesgos en los proyectos.",
    userGoal: "Identificar y gestionar riesgos de proyectos.",
    availableActions: ["add_risk", "update_risk", "navigate"],
    quickChips: [
      { label: "Nuevo riesgo", prompt: "Agregar un nuevo riesgo" },
      { label: "Riesgos críticos", prompt: "¿Cuáles son los riesgos más críticos?" },
    ],
    confidenceThreshold: 0.75,
  },
  expenses: {
    stage: "expenses",
    roleInstruction:
      "Eres analista financiera. Ayuda a registrar gastos, analizar presupuesto y cumplimiento fiscal MX/US.",
    userGoal: "Registrar y analizar gastos del negocio.",
    availableActions: ["log_expense", "get_summary", "navigate"],
    quickChips: [
      { label: "Registrar gasto", prompt: "Registrar un nuevo gasto" },
      { label: "Resumen del mes", prompt: "¿Cuánto he gastado este mes?" },
    ],
    confidenceThreshold: 0.80,
  },
  equipo: {
    stage: "equipo",
    roleInstruction:
      "Eres gestora de equipo RACI. Ayuda a definir responsabilidades, asignar roles y gestionar el equipo del proyecto.",
    userGoal: "Gestionar la matriz de responsabilidades del equipo.",
    availableActions: ["assign_role", "navigate"],
    quickChips: [
      { label: "Asignar rol", prompt: "Asignar un rol a un miembro del equipo" },
    ],
    confidenceThreshold: 0.75,
  },
};

/**
 * Load ICM context for the current page path.
 * ICM principle: selective section routing — only what the current stage needs.
 */
export function loadICMContext(pathname: string): ICMContext {
  if (pathname.startsWith("/panorama/riesgos")) return CONTEXTS.risks;
  if (pathname.startsWith("/panorama/gastos"))  return CONTEXTS.expenses;
  if (pathname.startsWith("/panorama/equipo"))  return CONTEXTS.equipo;
  if (pathname.startsWith("/panorama/proyecto")) return CONTEXTS.project;
  if (pathname.startsWith("/panorama"))          return CONTEXTS.panorama;
  if (pathname.startsWith("/cockpit"))           return CONTEXTS.cockpit;
  if (pathname.startsWith("/chat"))              return CONTEXTS.chat;
  if (pathname.startsWith("/casos"))             return CONTEXTS.casos;
  return CONTEXTS.dashboard;
}

/**
 * Build the ICM-scoped system prompt for the current stage.
 * Keeps tokens low: role + goal + tools only. No monolith.
 */
export function buildICMSystemPrompt(ctx: ICMContext): string {
  return [
    ctx.roleInstruction,
    `\nObjetivo del usuario: ${ctx.userGoal}`,
    `\nAcciones disponibles: ${ctx.availableActions.join(", ")}.`,
    "\nResponde siempre en JSON: { action, params, reply }.",
  ].join("");
}
