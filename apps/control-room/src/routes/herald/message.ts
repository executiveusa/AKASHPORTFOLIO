import { Router, Request, Response } from 'express';
import { logger } from '../../lib/logger.js';
import {
  processMessageThroughHerald,
  classifyIntentFromMessage,
  type OpenClawMessage,
  type ConversationContext,
} from '../../lib/herald/openclaw-integration.js';

const router = Router();

/**
 * POST /api/herald/message
 *
 * Receives incoming message from OpenClaw gateway and routes to appropriate agent/skill
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { session_id, message, context, channel } = req.body;

    logger.info('HERALD: Message received', {
      session_id,
      channel,
      text_length: message.text.length,
    });

    // Convert to internal types
    const openclawMessage: OpenClawMessage = {
      id: message.id,
      channel,
      sender_id: message.sender_id,
      sender_name: message.sender_name,
      text: message.text,
      attachments: message.attachments,
      timestamp: message.timestamp,
    };

    const conversationContext: ConversationContext = context || {
      history: [],
    };

    // Process through HERALD
    const result = await processMessageThroughHerald(openclawMessage, conversationContext);

    logger.info('HERALD: Response generated', {
      response_id: result.response_id,
      skills_used: result.skills_used.length,
      execution_time: result.execution_time_ms,
    });

    res.json(result);
  } catch (error) {
    logger.error('HERALD: Error processing message', {
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(500).json({
      response_id: `err-${Date.now()}`,
      text: 'I encountered an error processing your message. Please try again.',
      confidence: 0,
      intent: 'error',
      agent: 'ErrorHandler',
      skills_used: [],
      execution_time_ms: 0,
    });
  }
});

/**
 * POST /api/herald/classify-intent
 *
 * Classify user intent without full message processing
 */
router.post('/classify-intent', async (req: Request, res: Response) => {
  try {
    const { text, context } = req.body;

    const conversationContext: ConversationContext = context || { history: [] };

    const classification = await classifyIntentFromMessage(text, conversationContext);

    res.json({
      intent: classification.intent,
      confidence: classification.confidence,
      timestamp: Date.now(),
    });
  } catch (error) {
    logger.error('HERALD: Intent classification error', {
      error: error instanceof Error ? error.message : String(error),
    });

    res.status(500).json({
      error: 'Intent classification failed',
    });
  }
});

export default router;
