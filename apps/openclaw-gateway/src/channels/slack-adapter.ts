import { Router, Request, Response } from 'express';
import { App as BoltApp, ExpressReceiver } from '@slack/bolt';
import { Message, ChannelType } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface SlackAdapterConfig {
  signingSecret: string;
  botToken: string;
  webhookPath?: string;
}

export class SlackAdapter {
  private router: Router;
  private app: BoltApp;
  private receiver: ExpressReceiver;
  private onMessageReceived?: (message: Message) => Promise<void>;

  constructor(config: SlackAdapterConfig) {
    this.receiver = new ExpressReceiver({
      signingSecret: config.signingSecret,
      endpoints: {
        events: config.webhookPath || '/slack',
      },
    });

    this.app = new BoltApp({
      token: config.botToken,
      signingSecret: config.signingSecret,
      receiver: this.receiver,
    });

    this.router = this.receiver.router;
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.app.message(async ({ message, say, client }) => {
      if (message.type === 'message' && message.text && !message.bot_id) {
        const openclawMessage: Message = {
          id: uuidv4(),
          channel: 'slack' as ChannelType,
          sender_id: message.user || 'unknown',
          sender_name: await this.getUserName(client, message.user),
          text: message.text,
          attachments: this.extractAttachments(message as any),
          metadata: {
            slack_ts: message.ts,
            slack_channel: message.channel,
            slack_thread_ts: message.thread_ts,
          },
          timestamp: Date.now(),
        };

        this.onMessageReceived?.(openclawMessage).catch((err) => {
          logger.error('Error processing Slack message:', err);
        });
      }
    });

    this.app.event('app_mention', async ({ event, say, client }) => {
      const openclawMessage: Message = {
        id: uuidv4(),
        channel: 'slack' as ChannelType,
        sender_id: event.user,
        sender_name: await this.getUserName(client, event.user),
        text: event.text,
        metadata: {
          slack_ts: event.ts,
          slack_channel: event.channel,
          slack_thread_ts: event.thread_ts,
        },
        timestamp: Date.now(),
      };

      this.onMessageReceived?.(openclawMessage).catch((err) => {
        logger.error('Error processing Slack app_mention:', err);
      });
    });
  }

  private async getUserName(client: any, userId: string): Promise<string> {
    try {
      const user = await client.users.info({ user: userId });
      return user.user.real_name || user.user.name || userId;
    } catch {
      return userId;
    }
  }

  private extractAttachments(message: any) {
    const attachments = [];

    if (message.files) {
      message.files.forEach((file: any) => {
        attachments.push({
          type: file.mimetype?.startsWith('image') ? 'image' : 'file',
          url: file.url_private,
          filename: file.name,
          mime_type: file.mimetype,
        });
      });
    }

    return attachments.length > 0 ? attachments : undefined;
  }

  async sendMessage(channelId: string, text: string, threadTs?: string): Promise<void> {
    try {
      logger.info('Sending Slack message', { channelId, threadTs });

      await this.app.client.chat.postMessage({
        channel: channelId,
        text,
        thread_ts: threadTs,
      });

      logger.info('Slack message sent', { channelId });
    } catch (error) {
      logger.error('Failed to send Slack message:', error);
      throw error;
    }
  }

  async sendBlocks(channelId: string, blocks: any[], threadTs?: string): Promise<void> {
    try {
      await this.app.client.chat.postMessage({
        channel: channelId,
        blocks,
        thread_ts: threadTs,
      });

      logger.info('Slack blocks sent', { channelId });
    } catch (error) {
      logger.error('Failed to send Slack blocks:', error);
      throw error;
    }
  }

  setMessageHandler(handler: (message: Message) => Promise<void>) {
    this.onMessageReceived = handler;
  }

  getRouter(): Router {
    return this.router;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const auth = await this.app.client.auth.test();
      return !!auth.ok;
    } catch (error) {
      logger.error('Slack health check failed:', error);
      return false;
    }
  }
}
