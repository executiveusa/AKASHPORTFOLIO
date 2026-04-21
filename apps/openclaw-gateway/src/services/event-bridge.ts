import axios, { AxiosInstance } from 'axios';
import { Message, HeraldResponse, HeraldRequest, ConversationContext, ChannelType } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class EventBridge {
  private heraldClient: AxiosInstance;
  private heraldUrl: string;
  private maxRetries: number = 3;
  private retryDelayMs: number = 1000;

  constructor(heraldUrl: string = process.env.HERALD_URL || 'http://localhost:4200') {
    this.heraldUrl = heraldUrl;
    this.heraldClient = axios.create({
      baseURL: heraldUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'X-OpenClaw-Gateway': 'true',
      },
    });
  }

  async sendMessageToHerald(
    sessionId: string,
    message: Message,
    context: ConversationContext
  ): Promise<HeraldResponse> {
    const payload: HeraldRequest = {
      session_id: sessionId,
      message,
      context,
      channel: message.channel,
    };

    logger.info(`Sending message to HERALD [${sessionId}]:`, {
      channel: message.channel,
      sender_id: message.sender_id,
      text_length: message.text.length,
    });

    return this.retryableRequest(
      () =>
        this.heraldClient.post<HeraldResponse>('/api/herald/message', payload).then((res) => res.data),
      'HERALD message request'
    );
  }

  async classifyIntent(text: string, context: ConversationContext): Promise<any> {
    const payload = {
      text,
      context,
    };

    logger.info('Classifying intent');

    return this.retryableRequest(
      () =>
        this.heraldClient
          .post<{ intent: string; confidence: number }>('/api/herald/classify-intent', payload)
          .then((res) => res.data),
      'Intent classification'
    );
  }

  async invokeSkill(skillName: string, params: Record<string, any>, context?: ConversationContext): Promise<any> {
    const payload = {
      skill: skillName,
      params,
      context,
    };

    logger.info(`Invoking skill: ${skillName}`);

    return this.retryableRequest(
      () =>
        this.heraldClient.post(`/api/herald/invoke-skill`, payload).then((res) => res.data),
      `Skill invocation: ${skillName}`
    );
  }

  async orchestrateWorkflow(workflowName: string, input: any, context?: ConversationContext): Promise<any> {
    const payload = {
      workflow: workflowName,
      input,
      context,
    };

    logger.info(`Orchestrating workflow: ${workflowName}`);

    return this.retryableRequest(
      () =>
        this.heraldClient.post(`/api/herald/orchestrate`, payload).then((res) => res.data),
      `Workflow orchestration: ${workflowName}`
    );
  }

  async updateVibeNode(agentName: string, skillName: string, confidence: number): Promise<void> {
    const payload = {
      agent: agentName,
      skill: skillName,
      confidence,
      timestamp: Date.now(),
    };

    logger.info(`Updating vibe node: ${agentName}/${skillName} = ${confidence}`);

    return this.retryableRequest(
      () =>
        this.heraldClient
          .post(`/api/herald/vibe-node/update`, payload)
          .then(() => undefined),
      `Vibe node update: ${agentName}/${skillName}`
    );
  }

  private async retryableRequest<T>(
    request: () => Promise<T>,
    description: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        return await request();
      } catch (error) {
        lastError = error as Error;
        if (attempt < this.maxRetries - 1) {
          const delay = this.retryDelayMs * Math.pow(2, attempt);
          logger.warn(`${description} failed (attempt ${attempt + 1}/${this.maxRetries}), retrying in ${delay}ms`, {
            error: lastError.message,
          });
          await this.sleep(delay);
        }
      }
    }

    logger.error(`${description} failed after ${this.maxRetries} attempts`, {
      error: lastError?.message,
    });
    throw lastError || new Error(`${description} failed`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.heraldClient.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.error('HERALD health check failed', { error });
      return false;
    }
  }
}
