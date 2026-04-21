import express, { Express } from 'express';
import cors from 'cors';
import { logger } from './utils/logger.js';
import { getConfig } from './utils/config.js';
import { SessionManager } from './services/session-manager.js';
import { EventBridge } from './services/event-bridge.js';
import { ResponseRouter } from './services/response-router.js';
import { WhatsAppAdapter } from './channels/whatsapp-adapter.js';
import { TelegramAdapter } from './channels/telegram-adapter.js';
import { SlackAdapter } from './channels/slack-adapter.js';
import { DiscordAdapter } from './channels/discord-adapter.js';
import { Message, ChannelType } from './types/index.js';

export class OpenClawGateway {
  private app: Express;
  private sessionManager: SessionManager;
  private eventBridge: EventBridge;
  private responseRouter: ResponseRouter;
  private whatsappAdapter?: WhatsAppAdapter;
  private telegramAdapter?: TelegramAdapter;
  private slackAdapter?: SlackAdapter;
  private discordAdapter?: DiscordAdapter;

  constructor() {
    this.app = express();
    const config = getConfig();

    this.sessionManager = new SessionManager(config.DATABASE_PATH);
    this.eventBridge = new EventBridge(config.HERALD_URL);
    this.responseRouter = new ResponseRouter();

    this.setupMiddleware();
    this.setupRoutes();
    this.setupChannels();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ limit: '10mb', extended: true }));

    this.app.use((req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes() {
    this.app.get('/health', async (req, res) => {
      const heraldHealth = await this.eventBridge.healthCheck();

      res.json({
        status: heraldHealth ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        herald: heraldHealth ? 'connected' : 'disconnected',
      });
    });

    this.app.post('/api/gateway/send', async (req, res) => {
      try {
        const { channel, sender_id, text, session_id } = req.body;

        if (!channel || !sender_id || !text) {
          return res.status(400).json({ error: 'Missing required fields' });
        }

        const adapter = this.getAdapterForChannel(channel);
        if (!adapter) {
          return res.status(400).json({ error: `Channel ${channel} is not enabled` });
        }

        await this.sendMessageViaChannel(channel, sender_id, text);

        res.json({ success: true, message_id: `${Date.now()}` });
      } catch (error) {
        logger.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
      }
    });

    this.app.get('/api/gateway/session/:sessionId', async (req, res) => {
      try {
        const session = await this.sessionManager.getSession(req.params.sessionId);
        if (!session) {
          return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);
      } catch (error) {
        logger.error('Error retrieving session:', error);
        res.status(500).json({ error: 'Failed to retrieve session' });
      }
    });

    this.app.get('/api/gateway/history/:sessionId', async (req, res) => {
      try {
        const limit = parseInt(req.query.limit as string) || 20;
        const context = await this.sessionManager.getConversationHistory(req.params.sessionId, limit);

        res.json(context);
      } catch (error) {
        logger.error('Error retrieving history:', error);
        res.status(500).json({ error: 'Failed to retrieve history' });
      }
    });
  }

  private setupChannels() {
    const config = getConfig();

    if (config.WHATSAPP_ENABLED === 'true' && config.WHATSAPP_ACCOUNT_SID && config.WHATSAPP_AUTH_TOKEN) {
      this.whatsappAdapter = new WhatsAppAdapter({
        accountSid: config.WHATSAPP_ACCOUNT_SID,
        authToken: config.WHATSAPP_AUTH_TOKEN,
        phoneNumber: config.WHATSAPP_PHONE_NUMBER || '',
      });
      this.whatsappAdapter.setMessageHandler((msg) => this.handleMessage(msg));
      this.app.use(this.whatsappAdapter.getRouter());
      logger.info('WhatsApp adapter enabled');
    }

    if (config.TELEGRAM_ENABLED === 'true' && config.TELEGRAM_BOT_TOKEN) {
      this.telegramAdapter = new TelegramAdapter({
        botToken: config.TELEGRAM_BOT_TOKEN,
      });
      this.telegramAdapter.setMessageHandler((msg) => this.handleMessage(msg));
      this.app.use(this.telegramAdapter.getRouter());
      logger.info('Telegram adapter enabled');
    }

    if (config.SLACK_ENABLED === 'true' && config.SLACK_BOT_TOKEN && config.SLACK_SIGNING_SECRET) {
      this.slackAdapter = new SlackAdapter({
        botToken: config.SLACK_BOT_TOKEN,
        signingSecret: config.SLACK_SIGNING_SECRET,
      });
      this.slackAdapter.setMessageHandler((msg) => this.handleMessage(msg));
      this.app.use(this.slackAdapter.getRouter());
      logger.info('Slack adapter enabled');
    }

    if (config.DISCORD_ENABLED === 'true' && config.DISCORD_BOT_TOKEN) {
      this.discordAdapter = new DiscordAdapter({
        botToken: config.DISCORD_BOT_TOKEN,
      });
      this.discordAdapter.setMessageHandler((msg) => this.handleMessage(msg));
      logger.info('Discord adapter enabled');
    }
  }

  private async handleMessage(message: Message) {
    try {
      logger.info(`Processing message from ${message.channel}`, {
        sender: message.sender_id,
        textLength: message.text.length,
      });

      // Get or create session
      const session = await this.sessionManager.createOrGetSession(
        message.sender_id,
        message.channel,
        { first_message_at: Date.now() }
      );

      // Add user message to history
      await this.sessionManager.addMessage(session.id, 'user', message.text);

      // Get updated context
      let context = await this.sessionManager.getConversationHistory(session.id);

      // Send to HERALD for processing
      const heraldResponse = await this.eventBridge.sendMessageToHerald(session.id, message, context);

      // Add assistant response to history
      await this.sessionManager.addMessage(session.id, 'assistant', heraldResponse.text, heraldResponse.intent);

      // Format response for channel
      const formattedResponse = this.responseRouter.formatForChannel(
        heraldResponse,
        message.channel,
        message.sender_id
      );

      // Send response back to user
      await this.sendMessageViaChannel(message.channel, message.sender_id, formattedResponse.text);

      logger.info(`Message processed successfully [${session.id}]`);
    } catch (error) {
      logger.error('Error handling message:', error);
      // Send error message to user if possible
      try {
        await this.sendMessageViaChannel(
          message.channel,
          message.sender_id,
          "Sorry, I encountered an error processing your message. Please try again."
        );
      } catch (sendError) {
        logger.error('Error sending error message:', sendError);
      }
    }
  }

  private async sendMessageViaChannel(channel: ChannelType, senderId: string, text: string): Promise<void> {
    switch (channel) {
      case 'whatsapp':
        if (this.whatsappAdapter) await this.whatsappAdapter.sendMessage(senderId, text);
        break;
      case 'telegram':
        if (this.telegramAdapter) await this.telegramAdapter.sendMessage(senderId, text);
        break;
      case 'slack':
        if (this.slackAdapter) await this.slackAdapter.sendMessage(senderId, text);
        break;
      case 'discord':
        if (this.discordAdapter) await this.discordAdapter.sendMessage(senderId, text);
        break;
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  private getAdapterForChannel(channel: ChannelType) {
    switch (channel) {
      case 'whatsapp':
        return this.whatsappAdapter;
      case 'telegram':
        return this.telegramAdapter;
      case 'slack':
        return this.slackAdapter;
      case 'discord':
        return this.discordAdapter;
      default:
        return null;
    }
  }

  async start() {
    const config = getConfig();
    const port = config.PORT;
    const host = config.HOST;

    return new Promise<void>((resolve) => {
      this.app.listen(port, host, () => {
        logger.info(`🔌 OpenClaw Gateway running on http://${host}:${port}`);
        logger.info('Channels enabled:', {
          whatsapp: !!this.whatsappAdapter,
          telegram: !!this.telegramAdapter,
          slack: !!this.slackAdapter,
          discord: !!this.discordAdapter,
        });
        resolve();
      });
    });
  }

  async shutdown() {
    logger.info('Shutting down OpenClaw Gateway...');
    await this.sessionManager.close();
    if (this.discordAdapter) await this.discordAdapter.disconnect();
    logger.info('Gateway shutdown complete');
  }
}
