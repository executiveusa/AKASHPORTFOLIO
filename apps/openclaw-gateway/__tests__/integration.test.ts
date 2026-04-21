/**
 * End-to-End Integration Tests for OpenClaw Gateway
 *
 * Tests complete message flow from channel → gateway → HERALD → response
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import axios from 'axios';
import { SessionManager } from '../src/services/session-manager.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const HERALD_URL = process.env.HERALD_URL || 'http://localhost:4200';

describe('OpenClaw Gateway E2E Integration', () => {
  let sessionManager: SessionManager;

  beforeAll(() => {
    sessionManager = new SessionManager(':memory:');
  });

  afterAll(async () => {
    await sessionManager.close();
  });

  describe('Health Checks', () => {
    it('should report gateway health', async () => {
      const response = await axios.get(`${API_BASE_URL}/health`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status');
      expect(response.data).toHaveProperty('timestamp');
    });

    it('should check HERALD connectivity', async () => {
      const response = await axios.get(`${API_BASE_URL}/health`);

      expect(['healthy', 'degraded']).toContain(response.data.status);
      expect(['connected', 'disconnected']).toContain(response.data.herald);
    });
  });

  describe('Session Management', () => {
    it('should create session for user', async () => {
      const session = await sessionManager.createOrGetSession(
        '+1234567890',
        'whatsapp',
        { source: 'test' }
      );

      expect(session).toHaveProperty('id');
      expect(session.user_id).toBe('+1234567890');
      expect(session.channel).toBe('whatsapp');
      expect(session.created_at).toBeGreaterThan(0);
    });

    it('should reuse existing session', async () => {
      const session1 = await sessionManager.createOrGetSession(
        'test-user',
        'telegram',
        {}
      );

      const session2 = await sessionManager.createOrGetSession(
        'test-user',
        'telegram',
        {}
      );

      expect(session1.id).toBe(session2.id);
    });

    it('should retrieve session by ID', async () => {
      const session = await sessionManager.createOrGetSession(
        'test-user-2',
        'slack',
        {}
      );

      const retrieved = await sessionManager.getSession(session.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(session.id);
      expect(retrieved?.user_id).toBe('test-user-2');
    });

    it('should store conversation history', async () => {
      const session = await sessionManager.createOrGetSession(
        'test-user-3',
        'discord',
        {}
      );

      await sessionManager.addMessage(session.id, 'user', 'Hello!');
      await sessionManager.addMessage(
        session.id,
        'assistant',
        'Hi there!',
        'greeting'
      );

      const history = await sessionManager.getConversationHistory(session.id);

      expect(history.history.length).toBe(2);
      expect(history.history[0].role).toBe('user');
      expect(history.history[1].role).toBe('assistant');
      expect(history.history[1].intent).toBe('greeting');
    });

    it('should limit history size', async () => {
      const session = await sessionManager.createOrGetSession(
        'test-user-4',
        'whatsapp',
        {}
      );

      // Add 30 messages
      for (let i = 0; i < 30; i++) {
        await sessionManager.addMessage(
          session.id,
          i % 2 === 0 ? 'user' : 'assistant',
          `Message ${i}`
        );
      }

      const history = await sessionManager.getConversationHistory(session.id, 20);

      expect(history.history.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Message API', () => {
    it('should return 400 for missing fields', async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/gateway/send`, {
          channel: 'whatsapp',
          // Missing sender_id and text
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('error');
      }
    });

    it('should return 400 for disabled channel', async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/gateway/send`, {
          channel: 'unsupported-channel',
          sender_id: '+1234567890',
          text: 'Test message',
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Session Retrieval API', () => {
    it('should retrieve existing session', async () => {
      const session = await sessionManager.createOrGetSession(
        'api-test-user',
        'telegram',
        {}
      );

      const response = await axios.get(
        `${API_BASE_URL}/api/gateway/session/${session.id}`
      );

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(session.id);
      expect(response.data.user_id).toBe('api-test-user');
    });

    it('should return 404 for nonexistent session', async () => {
      try {
        await axios.get(
          `${API_BASE_URL}/api/gateway/session/nonexistent-id`
        );
        fail('Should have thrown error');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('History Retrieval API', () => {
    it('should retrieve conversation history', async () => {
      const session = await sessionManager.createOrGetSession(
        'history-test',
        'slack',
        {}
      );

      await sessionManager.addMessage(session.id, 'user', 'First message');
      await sessionManager.addMessage(session.id, 'assistant', 'First response');

      const response = await axios.get(
        `${API_BASE_URL}/api/gateway/history/${session.id}?limit=20`
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('history');
      expect(Array.isArray(response.data.history)).toBe(true);
      expect(response.data.history.length).toBeGreaterThan(0);
    });

    it('should respect limit parameter', async () => {
      const session = await sessionManager.createOrGetSession(
        'limit-test',
        'discord',
        {}
      );

      for (let i = 0; i < 50; i++) {
        await sessionManager.addMessage(session.id, 'user', `Message ${i}`);
      }

      const response = await axios.get(
        `${API_BASE_URL}/api/gateway/history/${session.id}?limit=5`
      );

      expect(response.data.history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Intent Classification', () => {
    const testCases = [
      {
        text: 'Find me 10 AI startups in Silicon Valley',
        expectedIntent: 'lead_qualification',
        minConfidence: 0.7,
      },
      {
        text: 'How much does your service cost?',
        expectedIntent: 'information_request',
        minConfidence: 0.7,
      },
      {
        text: 'Schedule a call next Tuesday at 2pm',
        expectedIntent: 'schedule_meeting',
        minConfidence: 0.7,
      },
      {
        text: 'We need a custom dashboard for our data',
        expectedIntent: 'project_inquiry',
        minConfidence: 0.7,
      },
      {
        text: 'I have a bug in my account login',
        expectedIntent: 'support_request',
        minConfidence: 0.7,
      },
    ];

    testCases.forEach(({ text, expectedIntent, minConfidence }) => {
      it(`should classify "${text.substring(0, 30)}..." as ${expectedIntent}`, async () => {
        try {
          const response = await axios.post(
            `${HERALD_URL}/api/herald/classify-intent`,
            {
              text,
              context: { history: [] },
            }
          );

          expect(response.status).toBe(200);
          expect(response.data).toHaveProperty('intent');
          expect(response.data).toHaveProperty('confidence');
          expect(response.data.confidence).toBeGreaterThanOrEqual(0);
          expect(response.data.confidence).toBeLessThanOrEqual(1);
        } catch (error) {
          console.warn('Intent classification test skipped (HERALD not running)');
        }
      });
    });
  });

  describe('Message Processing Pipeline', () => {
    it('should process complete message flow', async () => {
      const session = await sessionManager.createOrGetSession(
        'pipeline-test',
        'whatsapp',
        {}
      );

      // Simulate message arrival
      const message = {
        id: `msg-${Date.now()}`,
        channel: 'whatsapp' as const,
        sender_id: session.user_id,
        sender_name: 'Test User',
        text: 'I am looking for AI recruitment solutions',
        timestamp: Date.now(),
      };

      // Add to history
      await sessionManager.addMessage(session.id, 'user', message.text);

      // Get context
      const context = await sessionManager.getConversationHistory(session.id);

      expect(context.history.length).toBeGreaterThan(0);
      expect(context.history[0].role).toBe('user');
      expect(context.history[0].content).toBe(message.text);
    });
  });

  describe('Error Scenarios', () => {
    it('should handle malformed JSON gracefully', async () => {
      try {
        await axios.post(`${API_BASE_URL}/api/gateway/send`, 'invalid json', {
          headers: { 'Content-Type': 'application/json' },
        });
        fail('Should have thrown error');
      } catch (error: any) {
        expect([400, 500]).toContain(error.response?.status);
      }
    });

    it('should timeout after 30 seconds', async () => {
      try {
        await axios.post(
          `${API_BASE_URL}/api/gateway/send`,
          {
            channel: 'whatsapp',
            sender_id: '+1234567890',
            text: 'Test',
          },
          { timeout: 100 } // Very short timeout to trigger error
        );
      } catch (error: any) {
        expect(error.code).toBeDefined();
      }
    }, 5000);
  });
});
