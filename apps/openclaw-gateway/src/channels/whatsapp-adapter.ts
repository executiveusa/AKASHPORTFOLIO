import { Router, Request, Response } from 'express';
import { Twilio } from 'twilio';
import { Message, ChannelType } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface WhatsAppAdapterConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
  webhookPath?: string;
}

export class WhatsAppAdapter {
  private router: Router;
  private twilio: Twilio;
  private phoneNumber: string;
  private onMessageReceived?: (message: Message) => Promise<void>;
  private onSendMessage?: (senderId: string, text: string) => Promise<void>;

  constructor(config: WhatsAppAdapterConfig) {
    this.router = Router();
    this.twilio = new Twilio(config.accountSid, config.authToken);
    this.phoneNumber = config.phoneNumber;
    this.setupRoutes(config.webhookPath || '/whatsapp');
  }

  private setupRoutes(webhookPath: string) {
    this.router.post(webhookPath, this.handleWebhook.bind(this));
    this.router.get(webhookPath, this.verifyWebhook.bind(this));
  }

  private handleWebhook(req: Request, res: Response) {
    const body = req.body;

    logger.info('WhatsApp webhook received', {
      from: body.From,
      to: body.To,
      messageCount: body.NumMedia || 0,
    });

    if (body.Body) {
      const message: Message = {
        id: uuidv4(),
        channel: 'whatsapp' as ChannelType,
        sender_id: body.From.replace('whatsapp:', ''),
        sender_name: body.ProfileName || 'WhatsApp User',
        text: body.Body,
        attachments: this.extractAttachments(body),
        metadata: {
          twilio_sid: body.SmsMessageSid,
          account_sid: body.AccountSid,
        },
        timestamp: Date.now(),
      };

      this.onMessageReceived?.(message).catch((err) => {
        logger.error('Error processing WhatsApp message:', err);
      });
    }

    res.status(200).send('OK');
  }

  private verifyWebhook(req: Request, res: Response) {
    const token = process.env.WHATSAPP_WEBHOOK_TOKEN || 'webhook_token';
    const verifyToken = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (verifyToken === token) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send('Forbidden');
    }
  }

  private extractAttachments(body: any) {
    const attachments = [];

    for (let i = 0; i < (body.NumMedia || 0); i++) {
      const mediaUrl = body[`MediaUrl${i}`];
      const mediaType = body[`MediaContentType${i}`];

      if (mediaUrl) {
        const type = mediaType?.split('/')[0] || 'file';
        attachments.push({
          type: type as 'image' | 'video' | 'audio' | 'file',
          url: mediaUrl,
          mime_type: mediaType,
        });
      }
    }

    return attachments.length > 0 ? attachments : undefined;
  }

  async sendMessage(senderId: string, text: string): Promise<void> {
    try {
      const from = `whatsapp:${this.phoneNumber}`;
      const to = `whatsapp:${senderId}`;

      logger.info('Sending WhatsApp message', { to, textLength: text.length });

      const message = await this.twilio.messages.create({
        from,
        to,
        body: text,
      });

      logger.info('WhatsApp message sent', { messageSid: message.sid });
    } catch (error) {
      logger.error('Failed to send WhatsApp message:', error);
      throw error;
    }
  }

  setMessageHandler(handler: (message: Message) => Promise<void>) {
    this.onMessageReceived = handler;
  }

  setSendHandler(handler: (senderId: string, text: string) => Promise<void>) {
    this.onSendMessage = handler;
  }

  getRouter(): Router {
    return this.router;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const messages = await this.twilio.messages.list({ limit: 1 });
      return true;
    } catch (error) {
      logger.error('WhatsApp health check failed:', error);
      return false;
    }
  }
}
