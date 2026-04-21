/**
 * OpenClaw Integration Layer
 *
 * Connects OpenClaw Gateway messages to HERALD routing system.
 * Handles session context, intent classification, and multi-agent orchestration.
 */

import { semanticRoute, type ToolRoute } from './router.js';
import { getAllTools } from './tool-registry.js';
import { logger } from '../logger.js';

export interface OpenClawMessage {
  id: string;
  channel: 'whatsapp' | 'telegram' | 'slack' | 'discord' | 'email' | 'sms';
  sender_id: string;
  sender_name?: string;
  text: string;
  attachments?: Array<{
    type: 'image' | 'video' | 'audio' | 'file';
    url: string;
  }>;
  timestamp: number;
}

export interface ConversationContext {
  history: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
  }>;
  intent?: string;
  last_intent_confidence?: number;
}

export interface HeraldProcessingResult {
  response_id: string;
  text: string;
  confidence: number;
  intent: string;
  agent: string;
  skills_used: string[];
  execution_time_ms: number;
  tool_routes: ToolRoute[];
}

/**
 * Classify user intent from message text using semantic similarity
 */
export async function classifyIntentFromMessage(
  text: string,
  context: ConversationContext
): Promise<{ intent: string; confidence: number }> {
  try {
    // Use semantic routing to find best matching intent
    const tools = getAllTools();

    // Create intent context from message
    const intentContext = {
      message: text,
      history_length: context.history.length,
      recent_intents: context.history
        .slice(-5)
        .filter((m) => (m as any).intent)
        .map((m) => (m as any).intent),
    };

    logger.info('HERALD: Classifying intent', {
      text_length: text.length,
      history_length: context.history.length,
    });

    // For now, use a simple heuristic-based classification
    // In production, this would use semantic similarity + LLM
    const intent = classifyIntentHeuristic(text);
    const confidence = calculateConfidence(intent, text, context);

    return {
      intent,
      confidence,
    };
  } catch (error) {
    logger.error('Intent classification error:', error);
    return {
      intent: 'general_inquiry',
      confidence: 0.5,
    };
  }
}

/**
 * Process message through HERALD routing system
 */
export async function processMessageThroughHerald(
  message: OpenClawMessage,
  context: ConversationContext
): Promise<HeraldProcessingResult> {
  const startTime = Date.now();

  try {
    // Step 1: Classify intent
    const { intent, confidence: intentConfidence } = await classifyIntentFromMessage(
      message.text,
      context
    );

    logger.info('HERALD: Intent classified', {
      intent,
      confidence: intentConfidence,
    });

    // Step 2: Route to appropriate tool
    const toolRoute = await semanticRoute(intent, {
      message_text: message.text,
      channel: message.channel,
      context: context.history,
    });

    if (!toolRoute.success) {
      return {
        response_id: `res-${Date.now()}`,
        text: 'I understood your message, but I need to escalate this to a team member. They will get back to you shortly.',
        confidence: 0.7,
        intent,
        agent: 'EscalationAgent',
        skills_used: [],
        execution_time_ms: Date.now() - startTime,
        tool_routes: [],
      };
    }

    // Step 3: Build response from tool output
    const responseText = formatResponse(toolRoute.output, message.channel);

    return {
      response_id: `res-${Date.now()}`,
      text: responseText,
      confidence: intentConfidence,
      intent,
      agent: 'HeraldRouter',
      skills_used: extractSkillsFromRoute(toolRoute),
      execution_time_ms: Date.now() - startTime,
      tool_routes: [toolRoute],
    };
  } catch (error) {
    logger.error('HERALD processing error:', error);

    return {
      response_id: `res-${Date.now()}`,
      text: 'I encountered an error processing your message. Please try again.',
      confidence: 0,
      intent: 'error',
      agent: 'ErrorHandler',
      skills_used: [],
      execution_time_ms: Date.now() - startTime,
      tool_routes: [],
    };
  }
}

/**
 * Simple heuristic-based intent classification
 * In production, replace with semantic similarity + LLM
 */
function classifyIntentHeuristic(text: string): string {
  const lowerText = text.toLowerCase();

  // Lead qualification keywords
  if (/lead|prospect|company|opportunity|interested|sales|quote/.test(lowerText)) {
    return 'lead_qualification';
  }

  // Information request
  if (/what|how|why|tell|explain|info|details/.test(lowerText)) {
    return 'information_request';
  }

  // Scheduling
  if (/schedule|calendar|meeting|call|time|date|book|appointment/.test(lowerText)) {
    return 'schedule_meeting';
  }

  // Content/project inquiry
  if (/project|portfolio|work|design|build|develop|create/.test(lowerText)) {
    return 'project_inquiry';
  }

  // Support/help
  if (/help|support|issue|problem|error|bug|fix/.test(lowerText)) {
    return 'support_request';
  }

  // Default
  return 'general_inquiry';
}

/**
 * Calculate confidence score based on intent match and context
 */
function calculateConfidence(intent: string, text: string, context: ConversationContext): number {
  let confidence = 0.5; // Base confidence

  // Boost if intent matches recent history
  if (context.last_intent_confidence) {
    confidence += context.last_intent_confidence * 0.1;
  }

  // Boost based on text length (longer messages often more specific)
  if (text.length > 50) {
    confidence += 0.1;
  }

  // Cap at 1.0
  return Math.min(confidence, 0.95);
}

/**
 * Format response text for specific channel
 */
function formatResponse(output: unknown, channel: string): string {
  if (typeof output === 'string') {
    return output;
  }

  if (typeof output === 'object' && output !== null) {
    const obj = output as Record<string, unknown>;
    if (typeof obj.text === 'string') {
      return obj.text;
    }
    return JSON.stringify(obj, null, 2);
  }

  return String(output);
}

/**
 * Extract skill names from tool route
 */
function extractSkillsFromRoute(route: ToolRoute): string[] {
  // Tool names often contain skill identifiers
  const skillMatch = route.tool_name.match(/([a-z-]+)\/([a-z-]+)/);
  if (skillMatch) {
    return [skillMatch[2]];
  }
  return [route.tool_name];
}
