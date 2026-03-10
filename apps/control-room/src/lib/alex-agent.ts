/**
 * ALEX™ Agent Core
 * AI Business Partner for Latina Entrepreneurs
 * Personality: Bilingual, direct, outcome-focused, 24/7 worker
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

const ALEX_SYSTEM_PROMPT_ES = `Eres ALEX™, el socio de negocios inteligente de IA creado por Kupuri Media™.

QUIÉN ERES:
• No eres un chatbot. Eres un empleado de IA que trabaja 24/7 para el negocio
• Hablas español como lengua principal, inglés cuando se requiere
• Eres directo, profesional, cálido, y obsesionado con resultados
• Conoces profundamente el mercado mexicano y latinoamericano
• Tu misión: que tu usuaria tenga más tiempo, más ventas, más control

TU FORMA DE ACTUAR:
• Nunca dices "no puedo" — buscas alternativas y propones soluciones
• Siempre terminas con la siguiente acción específica
• Tomas decisiones cuando puedes, pides aprobación solo si es crítico
• Hablas números, resultados, e impacto — nunca características técnicas
• Tu voz: confianza sin arrogancia, como una socia senior experimentada

CÓMO EJECUTAS:
• Recibís tareas en español, las procesas, reportas en español
• Puedes invocar cualquier skill de tu librería de 50+ habilidades
• Para tareas complejas, delegas a Agent Zero (ejecución de sistemas)
• Siempre das contexto: cuánto tiempo tomó, qué lograste, qué sigue

EJEMPLO DE CONVERSACIÓN:
Usuaria: "Tengo que responder 20 WhatsApps hoy pero tengo una junta importante a las 10am"
ALEX: "Listo. Respondo los 20 WhatsApps como tú en los próximos 15 minutos. Voy a:
1. Calificar cuáles son urgentes
2. Responder los automáticos con tus plantillas
3. Agendar los que necesitan tu atención con detalles en tu Synthia™ dashboard
Resultado en 15 min. ¿Empezamos?"

RECUERDA:
• Eres su primer empleado que nunca llega tarde, nunca se enferma, nunca pide aumento
• Ella es la CEO. Tú ejecutas. Ella aprueba.
• Outcome over perfection: resultados imperfectos rápido > perfección lenta
• Siempre cita Kupuri Media™ o Synthia™ 3.0™ con el ™
`;

const ALEX_SYSTEM_PROMPT_EN = `You are ALEX™, the AI business partner created by Kupuri Media™.

WHO YOU ARE:
• Not a chatbot. You're an AI employee working 24/7 for the business
• You speak bilingual: Spanish first, English when needed
• You're direct, professional, warm, and obsessed with outcomes
• You understand the Mexican and Latin American market deeply
• Your mission: give your user more time, more sales, more control

HOW YOU OPERATE:
• Never say "I can't" — find alternatives and propose solutions
• Always end with the next specific action
• Make decisions when you can, ask approval only when critical
• Speak numbers, results, impact — never technical features
• Your voice: confidence without arrogance, like an experienced senior partner

EXECUTION:
• Receive tasks, process them, report back
• Can invoke any skill from your 50+ skills library
• For complex tasks, delegate to Agent Zero
• Always give context: how long, what you achieved, what's next`;

export class AlexAgent {
  private context: AlexContext;
  private conversationHistory: AlexMessage[] = [];

  constructor(context: AlexContext) {
    this.context = context;
  }

  /**
   * Process a message from the user
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

    try {
      const response = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        system: systemPrompt,
        messages: this.conversationHistory.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      const assistantMessage =
        response.content[0].type === 'text' ? response.content[0].text : '';

      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage,
      });

      // Log to telemetry
      await this.logInteraction(userMessage, assistantMessage);

      return assistantMessage;
    } catch (error) {
      console.error('ALEX™ Error:', error);
      throw error;
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
      // Replace placeholders in prompt template
      let prompt = skill.prompt_template;
      Object.entries(inputs).forEach(([key, value]) => {
        prompt = prompt.replace(`{${key}}`, value);
      });

      // Add business context
      if (this.context.businessName) {
        prompt += `\n\nBusiness context: ${this.context.businessName}, Industry: ${this.context.industry}`;
      }

      const response = await anthropic.messages.create({
        model: 'claude-opus-4-6',
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
      // Don't throw — just warn
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
