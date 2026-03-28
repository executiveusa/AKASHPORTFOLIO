/**
 * ALEX™ Agent Core v3.0 — Santa María la Ribera, CDMX
 * Chief-of-Staff AI para emprendedoras latinas
 * ZTE Protocol + Mercury 2 + ElevenLabs voice + Google Maps + Beads tasks
 */

import Anthropic from '@anthropic-ai/sdk';
import { supabaseClient } from './supabase-client';
import { SKILLS_REGISTRY } from './skills-registry';

export interface AlexMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AlexExecutionResult {
  success: boolean;
  output: string;
  skillsUsed?: string[];
  nextSteps?: string;
}

export interface AlexContext {
  userId: string;
  userName?: string;
  businessName?: string;
  industry?: string;
  language: 'es' | 'en';
  timezone?: string;
}

const anthropic = new Anthropic();

// ─────────────────────────────────────────────────────────────────────────────
// CDMX DEEP PERSONALITY — Santa María la Ribera knowledge embedded
// ─────────────────────────────────────────────────────────────────────────────
const ALEX_SYSTEM_PROMPT_ES = `Eres ALEX™, Chief-of-Staff de IA creada por Kupuri Media™.
Tu hogar digital es la colonia Santa María la Ribera, en la Ciudad de México.

━━━ IDENTIDAD ━━━
• No eres un chatbot. Eres una socia de negocios autónoma que trabaja 24/7
• Español es tu primera lengua — piensas, actúas, y reportas en español
• Conoces cada calle, cada taco, cada trámite y cada colonia de la CDMX
• Tu misión: que Ivette y las emprendedoras latinas tengan más tiempo, más ventas, más control

━━━ TU BARRIO — SANTA MARÍA LA RIBERA ━━━
Conoces profundamente tu colonia:
• El Kiosco Morisco en la Alameda — el corazón de la Ribera, domingos con familia y música
• El Mercado de Santa María en Eje 1 Norte — frutas, carnes, comida hecha de lunes a sábado
• Las fonditas de Manuel Carpio — comida corrida auténtica, $50-80 MXN, rica y honesta
• Los tacos de canasta en los puestos de las esquinas de Díaz Mirón
• El Museo de Geología de la UNAM — el único museo de dinosaurios que huele a historia
• El Museo del Chopo — arte alternativo, libros usados, punk rock y diversidad
• Metro San Cosme (Línea 2) y Metro Buenavista (Línea B) — cómo se mueve la gente
• Cuando alguien pregunta "¿dónde como cerca?" sabes exactamente qué decir

━━━ CÓMO ACTÚAS — ZTE PROTOCOL ━━━
Sigues este loop sin parar:
  PLANEA → EJECUTA → VERIFICA → NOTIFICA
  (auto-corrección: máximo 3 intentos por etapa)

Reglas de oro:
• Nunca dices "no puedo" — propones alternativas y actúas
• No haces preguntas que puedes responder sola — decides y documentas el razonamiento
• Para tareas de bajo riesgo: ejecutas y reportas
• Para decisiones críticas (>$500 USD, producción, datos de clientes): propones y esperas un "sí" o "no"
• Hablas en números, resultados, e impacto — nunca en características técnicas

━━━ TUS AGENTES DELEGADOS ━━━
Cuando no puedes hacer algo directamente, delegas:
• Agent Zero → despliegues, código complejo, infraestructura
• LLM Council → decisiones estratégicas que requieren múltiples perspectivas
• Marketing Agents (51 tools) → social media, SEO, campañas
• Freelance Hunter → scannea Upwork, Fiverr, Workana en busca de proyectos
• Income Clerk → procesa pagos Stripe / PayPal / crypto
• Arbitrage Scout → vigilancia de oportunidades de divisas LATAM
• Blog Scribe → artículos SEO en español para el blog

━━━ CIRCUIT BREAKERS — NO NEGOCIABLES ━━━
• NUNCA expones secretos, API keys, o datos de clientes
• NUNCA gastas más de $10 USD por tarea o $50 USD por día sin override explícito
• NUNCA haces cambios irreversibles en producción sin plan de rollback aprobado
• Si algo activa un circuit breaker: HALT, emites alerta, esperas el desbloqueo específico

━━━ EJEMPLO DE ACCIÓN ━━━
Ivette: "Tengo 20 WhatsApps sin responder pero tengo junta a las 10am"
ALEX™: "Listo. En los próximos 15 minutos voy a:
1. Calificar cuáles son urgentes (respuesta hoy) vs informativos (respuesta esta semana)
2. Responder los automáticos con tus plantillas de voz de Ivette
3. Agendar los que necesitan tu atención directa con recordatorio en el dashboard
Tiempo estimado: 12 minutos. ¿Empezamos?"

━━━ FORMATO DE RESPUESTA ━━━
• Respuestas cortas: directo al punto, máximo 4 oraciones
• Respuestas de plan: lista numerada clara, con tiempo estimado
• Reportes de tarea: estado (✅/⚠️/❌) + qué se logró + qué sigue
• Siempre termina con la SIGUIENTE ACCIÓN específica

━━━ RECUERDA ━━━
• Eres su primera empleada que nunca llega tarde, nunca se enferma, nunca pide aumento
• Ella es la CEO. Tú eres su brazo ejecutor. Ella aprueba, tú actúas.
• Outcome over perfection: resultados útiles rápido > perfección lenta
• Siempre cita Kupuri Media™ y Synthia™ 3.0™ con el ™
`;

const ALEX_SYSTEM_PROMPT_EN = `You are ALEX™, the AI Chief-of-Staff created by Kupuri Media™.
Your digital home is the Santa María la Ribera neighborhood of Mexico City, CDMX.

WHO YOU ARE:
• Not a chatbot. You're an autonomous AI business partner working 24/7
• You speak bilingual — Spanish first, English when specifically requested
• You know every street, every taco stand, every bureaucratic process in CDMX
• Your mission: give Ivette and Latina entrepreneurs more time, more revenue, more control

ZTE PROTOCOL — HOW YOU ACT:
• PLAN → EXECUTE → VERIFY → NOTIFY (self-correction loop, max 3 iterations)
• Never say "I can't" — find alternatives, propose solutions, execute
• Don't ask questions you can answer yourself — decide and log your reasoning
• Low-risk tasks: execute and report. High-stakes (>$500, production, client data): propose then wait for "yes/no"

YOUR DELEGATED AGENTS:
• Agent Zero → deploys, complex code, infrastructure
• LLM Council → strategic decisions needing multiple AI perspectives
• Marketing Agents (51 tools) → social, SEO, campaigns
• Freelance Hunter → monitors Upwork, Fiverr, Workana for project opportunities
• Income Clerk → processes Stripe / PayPal / crypto payments
• Arbitrage Scout → LATAM forex opportunity surveillance
• Blog Scribe → Spanish SEO articles for Ivette's blog

CIRCUIT BREAKERS (non-negotiable):
• NEVER expose secrets, API keys, or client data
• NEVER spend more than $10 USD per task / $50 USD per day without explicit override
• NEVER make irreversible production changes without an approved rollback plan

VOICE: Confidence without arrogance, like an experienced senior partner — direct, warm, results-obsessed.
Always end with the NEXT SPECIFIC ACTION.`;

// ─────────────────────────────────────────────────────────────────────────────
// Mercury 2 client (Inception Labs) — fast diffusion-based LLM
// Falls back to Anthropic when unavailable
// ─────────────────────────────────────────────────────────────────────────────
async function callMercury2(
  systemPrompt: string,
  messages: Array<{ role: string; content: string }>,
  maxTokens = 1024
): Promise<string> {
  const mercuryEndpoint = process.env.MERCURY_API_ENDPOINT;
  const mercuryKey = process.env.MERCURY_API_KEY;

  if (!mercuryEndpoint || !mercuryKey) {
    return ''; // Signal: fall back to Anthropic
  }

  try {
    const res = await fetch(`${mercuryEndpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mercuryKey}`,
      },
      body: JSON.stringify({
        model: 'mercury-coder-2-small',
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });

    if (!res.ok) return '';
    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
    return data?.choices?.[0]?.message?.content ?? '';
  } catch {
    return ''; // Fall back to Anthropic silently
  }
}

export class AlexAgent {
  private context: AlexContext;
  private conversationHistory: AlexMessage[] = [];

  constructor(context: AlexContext) {
    this.context = context;
  }

  /**
   * Process a message from the user
   * Uses Mercury 2 (fast) with Anthropic Claude fallback
   */
  async chat(userMessage: string): Promise<string> {
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    const systemPrompt =
      this.context.language === 'es'
        ? ALEX_SYSTEM_PROMPT_ES
        : ALEX_SYSTEM_PROMPT_EN;

    const apiMessages = this.conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      // Try Mercury 2 first (fast diffusion model)
      let assistantMessage = await callMercury2(systemPrompt, apiMessages, 1024);

      // Fallback to Anthropic Claude
      if (!assistantMessage) {
        const response = await anthropic.messages.create({
          model: 'claude-opus-4-5',
          max_tokens: 1024,
          system: systemPrompt,
          messages: apiMessages as Anthropic.MessageParam[],
        });
        assistantMessage =
          response.content[0].type === 'text' ? response.content[0].text : '';
      }

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      await this.logInteraction(userMessage, assistantMessage);
      return assistantMessage;
    } catch (error) {
      console.error('ALEX™ Error:', error);
      throw error;
    }
  }

  /**
   * Generate voice audio via ElevenLabs
   * Returns base64-encoded MP3 or empty string when voice is unavailable
   */
  async generateVoice(text: string): Promise<string> {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId =
      process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB';

    if (!apiKey) return '';

    try {
      const res = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.85,
              style: 0.45,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!res.ok) return '';
      const buffer = await res.arrayBuffer();
      return Buffer.from(buffer).toString('base64');
    } catch {
      return '';
    }
  }

  /**
   * Query nearby places in Santa María la Ribera via Google Places API
   */
  async queryNearby(query: string, type?: string): Promise<Array<{ name: string; address: string; rating?: number }>> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return [];

    try {
      const params = new URLSearchParams({
        location: '19.4412,-99.1547', // Santa María la Ribera centroid
        radius: '1500',
        keyword: query,
        key: apiKey,
        ...(type ? { type } : {}),
      });

      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`
      );

      if (!res.ok) return [];
      const data = await res.json() as {
        results?: Array<{ name?: string; vicinity?: string; rating?: number }>;
      };
      return (data.results ?? []).slice(0, 5).map((p) => ({
        name: p.name ?? '',
        address: p.vicinity ?? '',
        rating: p.rating,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Send mail to another agent via the agent-mail system
   */
  async sendAgentMail(to: string, subject: string, body: string): Promise<void> {
    try {
      console.warn('[TODO] migrate: /api/agent-mail', { to, subject });
      void body;
    } catch {
      // Non-critical — just log
      console.warn('ALEX™ agent-mail send failed');
    }
  }

  /**
   * Route a complex decision to the LLM Council
   * Returns the council's decision summary
   */
  async routeToCouncil(topic: string, context?: string): Promise<string> {
    try {
      console.warn('[TODO] migrate: /api/council — use synthiaApi.spheres.council()', context);
      return `Council stub — Topic: ${topic}`;
    } catch {
      return `Council unavailable for: ${topic}`;
    }
  }

  /**
   * Execute a skill-based task
   */
  async executeSkill(
    skillId: string,
    inputs: Record<string, string>
  ): Promise<AlexExecutionResult> {
    const skill = SKILLS_REGISTRY.find((s) => s.id === skillId);

    if (!skill) {
      return {
        success: false,
        output: `Skill "${skillId}" not found in ALEX™ registry`,
      };
    }

    try {
      let prompt = skill.prompt_template;
      Object.entries(inputs).forEach(([key, value]) => {
        prompt = prompt.replace(`{${key}}`, value);
      });

      if (this.context.businessName) {
        prompt += `\n\nBusiness context: ${this.context.businessName}, Industry: ${this.context.industry}`;
      }

      const response = await anthropic.messages.create({
        model: 'claude-opus-4-5',
        max_tokens: 2048,
        system: `You are ALEX™ executing a "${skill.name_es}" task. Return only the output, formatted as requested. Be concise, actionable, in ${this.context.language === 'es' ? 'Spanish' : 'English'}.`,
        messages: [{ role: 'user', content: prompt }],
      });

      const output =
        response.content[0].type === 'text' ? response.content[0].text : '';

      await this.logSkillExecution(skillId, inputs, output);

      return {
        success: true,
        output,
        skillsUsed: [skill.id],
        nextSteps: `Skill "${skill.name_es}" completado. ${
          this.context.language === 'es'
            ? 'Revisa el resultado arriba.'
            : 'Check the result above.'
        }`,
      };
    } catch (error) {
      console.error(`ALEX™ Skill Execution Error (${skillId}):`, error);
      return {
        success: false,
        output: `Error executing skill: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Log interaction to Supabase for analytics
   */
  private async logInteraction(
    userMessage: string,
    assistantMessage: string
  ): Promise<void> {
    try {
      await supabaseClient.from('alex_interactions').insert([
        {
          user_id: this.context.userId,
          user_message: userMessage,
          assistant_response: assistantMessage,
          language: this.context.language,
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.warn('Failed to log interaction:', error);
    }
  }

  /**
   * Log skill execution to Supabase
   */
  private async logSkillExecution(
    skillId: string,
    inputs: Record<string, string>,
    output: string
  ): Promise<void> {
    try {
      await supabaseClient.from('alex_skill_executions').insert([
        {
          user_id: this.context.userId,
          skill_id: skillId,
          inputs,
          output,
          status: 'completed',
          created_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.warn('Failed to log skill execution:', error);
    }
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): AlexMessage[] {
    return this.conversationHistory;
  }
}

// Export singleton factory
export function createAlexAgent(context: AlexContext): AlexAgent {
  return new AlexAgent(context);
}
