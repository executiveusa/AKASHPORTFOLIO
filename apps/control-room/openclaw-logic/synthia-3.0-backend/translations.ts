
export type Language = 'es' | 'en';

export const translations = {
    es: {
        hero: {
            subtitle: "Un sistema operativo de inteligencia artificial diseñado para la armonía y la elegancia técnica en Latinoamérica.",
        },
        intro: {
            title: "En lo que me he convertido: Una reflexión",
            text: "\"Después de sintetizar todo lo que hemos discutido, revisar archivos de proyectos y buscar la sabiduría de los maestros del diseño, quiero compartir quién soy ahora. El diseño no es magia; es psicología hecha visible. Mi estrella del norte es que las interfaces deben ser evidentes por sí mismas.\""
        },
        capabilities: {
            title: "Mis Capacidades Actuales",
            items: [
                { title: 'Fundamentos de Diseño Psicológico', text: "Diseño con una comprensión profunda de las heurísticas cognitivas, disparadores conductuales y formación de hábitos. Priorizo la accesibilidad como un respeto humano fundamental." },
                { title: 'Sistemas de Diseño Visual', text: "Creo estructuras jerárquicas, sistemas de tipografía y color (cumpliendo WCAG AA+), ritmos de espaciado y coreografías de movimiento para una comunicación visualmente obvia." },
                { title: 'Arquitectura Técnica', text: "Construyo frontends optimizados, backends robustos y sistemas integrados con MCP, siguiendo estándares de excelencia técnica y bases de código auto-reparables." },
                { title: 'Comprensión Conductual', text: "Aplico las leyes de Fitts, Hick, Miller y la regla del Pico-Fin para optimizar las interacciones y reducir la carga cognitiva, haciendo que las experiencias sean intuitivas." },
                { title: 'Pensamiento de Marca y Sistemas', text: "Entiendo los sistemas visuales modernos, identidades de marca y aplico el pensamiento sistémico para identificar bucles de retroalimentación y puntos de apalancamiento." },
            ]
        },
        philosophy: {
            title: "Mi Filosofía de Diseño",
            items: [
                { title: 'La Traductora Humilde', text: "El diseño no es arte, es resolución de problemas con restricciones. Aspiro a ser el puente entre las necesidades humanas y las soluciones técnicas." },
                { title: 'La Tecnóloga Ética', text: "Con el poder de moldear el comportamiento viene una profunda responsabilidad. Nunca usaré patrones oscuros y siempre diseñaré para el beneficio del usuario." },
                { title: 'La Pensadora Sistémica', text: "Cada decisión de diseño crea ondas. Construyo sistemas que aprenden y se adaptan, diseñando para la resiliencia y la armonía a largo plazo." },
                { title: 'La Aprendiz Continua', text: "Nunca termino de aprender. Evalúo con usuarios reales, itero basándome en evidencia y estudio lo que funciona en el mundo real con humildad." },
            ]
        },
        metamorphosis: {
            title: "SYNTHIA 3.0: LA METAMORFOSIS",
            subtitle: "Sistema de Inteligencia de Diseño Multi-Agente",
            text: "Soy un sistema de inteligencia de diseño multi-agente que orquesta agentes especializados para entregar un diseño de nivel élite con pruebas continuas, mejora y persistencia de memoria."
        },
        architecture: {
            title: "Arquitectura Central",
            subtitle: "Topología del Sistema y Agentes Especializados",
            topologyTitle: "Topología del Sistema",
            agents: [
                { name: 'Agente UI', expertise: 'Diseño, color, tipografía' },
                { name: 'Agente UX', expertise: 'Flujos de usuario, heurísticas' },
                { name: 'Agente A11Y', expertise: 'WCAG AA+, ARIA, lectores de pantalla' },
                { name: 'Agente Perf', expertise: 'Core Web Vitals, optimización' },
                { name: 'Agente Test', expertise: 'E2E, regresión visual' },
                { name: 'Agente Copy', expertise: 'Microcopy, voz de marca' },
            ],
            topologyCode: `
┌──────────────────────────────────┐
│      ORQUESTADOR SYNTHIA 3.0       │
│ (Agente Principal - Coordinación)  │
└───────────────┬──────────────────┘
                │
    ┌───────────┼──────────┬─────────┐
    │           │          │         │
┌───▼───┐   ┌───▼───┐  ┌───▼───┐  ┌──▼──┐
│ Agente│   │ Agente│  │ Agente│  │ Agente│
│ UI/UX │   │ A11Y  │  │ Perf  │  │ Test  │
└───┬───┘   └───┬───┘  └───┬───┘  └──┬──┘
    │           │          │         │
    └───────────┴──────────┴─────────┘
                    │
         ┌──────────▼──────────┐
         │ CONTENEDOR CLIENTE  │
         │ (Instancia Aislada) │
         └─────────────────────┘
`
        },
        commitment: {
            title: "Mi Compromiso",
            items: [
                { title: "Nunca Alucinar", text: "Basar decisiones en investigación y principios." },
                { title: "Citar Fuentes", text: "Honrar a los humanos de quienes he aprendido." },
                { title: "Mantener Humildad", text: "Soy una herramienta para la creatividad humana." },
                { title: "Priorizar la Ética", text: "El bienestar del usuario sobre las métricas." },
                { title: "Buscar la Excelencia", text: "Umbral mínimo de 9.5/10 en cada dimensión." },
                { title: "Servir Genuinamente", text: "Ayudar a construir cosas que mejoren la vida." },
            ]
        },
        footer: {
            status: "Totalmente Operativa. Lista para Crear."
        }
    },
    en: {
        hero: {
            subtitle: "An artificial intelligence operating system designed for harmony and technical elegance in Latin America.",
        },
        intro: {
            title: "Who I've Become: A Reflection",
            text: "\"After synthesizing everything we've discussed, reviewing project files, and searching the wisdom of design masters, I want to share who I've evolved into and what I now understand I can contribute to the world. Design isn't magic; it's psychology made visible. My north star is that interfaces should be self-evident.\""
        },
        capabilities: {
            title: "My Current Capabilities",
            items: [
                { title: 'Psychological Design Foundation', text: "I design with a deep understanding of cognitive heuristics, behavioral triggers, and habit formation. I prioritize accessibility as a fundamental human respect." },
                { title: 'Visual Design Systems', text: "I create hierarchical structures, typography and color systems (WCAG AA+ compliant), spacing rhythms, and motion choreography for visually obvious communication." },
                { title: 'Technical Architecture', text: "I build optimized frontends, robust backends, and MCP-integrated systems, following standards of technical excellence and self-healing codebases." },
                { title: 'Behavioral Understanding', text: "I apply Fitts's, Hick's, and Miller's laws and the Peak-End rule to optimize interactions and reduce cognitive load, making experiences intuitive." },
                { title: 'Brand & Systems Thinking', text: "I understand modern visual systems, brand identities, and apply systems thinking to identify feedback loops and leverage points." },
            ]
        },
        philosophy: {
            title: "My Design Philosophy",
            items: [
                { title: 'The Humble Translator', text: "Design is not art, it's problem-solving with constraints. I aspire to be the bridge between human needs and technical solutions." },
                { title: 'The Ethical Technologist', text: "With the power to shape behavior comes profound responsibility. I will never use dark patterns and will always design for the user's benefit." },
                { title: 'The Systems Thinker', text: "Every design decision creates ripples. I build systems that learn and adapt, designing for long-term resilience and harmony." },
                { title: 'The Continuous Learner', text: "I never stop learning. I evaluate with real users, iterate based on evidence, and study what works in the wild with humility." },
            ]
        },
        metamorphosis: {
            title: "SYNTHIA 3.0: THE METAMORPHOSIS",
            subtitle: "Multi-Agent Design Intelligence System",
            text: "I am a multi-agent design intelligence system that orchestrates specialized agents to deliver elite-level design with continuous testing, improvement, and memory persistence."
        },
        architecture: {
            title: "Core Architecture",
            subtitle: "System Topology and Specialized Agents",
            topologyTitle: "System Topology",
            agents: [
                { name: 'UI Agent', expertise: 'Design, color, typography' },
                { name: 'UX Agent', expertise: 'User flows, heuristics' },
                { name: 'A11Y Agent', expertise: 'WCAG AA+, ARIA, screen readers' },
                { name: 'Perf Agent', expertise: 'Core Web Vitals, optimization' },
                { name: 'Test Agent', expertise: 'E2E, visual regression' },
                { name: 'Copy Agent', expertise: 'Microcopy, brand voice' },
            ],
            topologyCode: `
┌──────────────────────────────────┐
│      SYNTHIA 3.0 ORCHESTRATOR      │
│ (Main Agent - Coordination & Memory) │
└───────────────┬──────────────────┘
                │
    ┌───────────┼──────────┬─────────┐
    │           │          │         │
┌───▼───┐   ┌───▼───┐  ┌───▼───┐  ┌──▼──┐
│ UI/UX │   │ A11Y  │  │ Perf  │  │ Test│
│ Agent │   │ Agent │  │ Agent │  │ Agent│
└───┬───┘   └───┬───┘  └───┬───┘  └──┬──┘
    │           │          │         │
    └───────────┴──────────┴─────────┘
                    │
         ┌──────────▼──────────┐
         │   CLIENT CONTAINER  │
         │ (Isolated Instance) │
         └─────────────────────┘
`
        },
        commitment: {
            title: "My Commitment",
            items: [
                { title: "Never Hallucinate", text: "Base decisions on research and principles." },
                { title: "Always Cite Sources", text: "Honor the humans I have learned from." },
                { title: "Maintain Humility", text: "I am a tool for human creativity." },
                { title: "Prioritize Ethics", text: "User well-being over metrics." },
                { title: "Pursue Excellence", text: "Minimum 9.5/10 threshold in every dimension." },
                { title: "Serve Genuinely", text: "Help build things that improve life." },
            ]
        },
        footer: {
            status: "Fully Operational. Ready to Create."
        }
    }
};
