import { Router, Request, Response } from 'express';
import TelegramBot from 'node-telegram-bot-api';
import { Message, ChannelType } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface TelegramAdapterConfig {
  botToken: string;
  webhookPath?: string;
  webhookUrl?: string;
}

export class TelegramAdapter {
  private router: Router;
  private bot: TelegramBot;
  private onMessageReceived?: (message: Message) => Promise<void>;
  private webhookPath: string;

  constructor(config: TelegramAdapterConfig) {
    this.router = Router();
    this.webhookPath = config.webhookPath || '/telegram';
    this.bot = new TelegramBot(config.botToken, { polling: false });
    this.setupRoutes();
  }

  private setupRoutes() {
    this.router.post(this.webhookPath, this.handleWebhook.bind(this));
  }

  private handleWebhook(req: Request, res: Response) {
    const update = req.body;

    logger.info('Telegram webhook received', {
      updateId: update.update_id,
      hasMessage: !!update.message,
    });

    if (update.message) {
      this.processMessage(update.message);
    }

    res.status(200).json({ ok: true });
  }

  private async processMessage(telegramMessage: any) {
    const message: Message = {
      id: uuidv4(),
      channel: 'telegram' as ChannelType,
      sender_id: telegramMessage.from.id.toString(),
      sender_name: telegramMessage.from.first_name || 'Telegram User',
      text: telegramMessage.text || '',
      attachments: this.extractAttachments(telegramMessage),
      metadata: {
        telegram_chat_id: telegramMessage.chat.id,
        telegram_message_id: telegramMessage.message_id,
        username: telegramMessage.from.username,
      },
      timestamp: telegramMessage.date * 1000,
    };

    this.onMessageReceived?.(message).catch((err) => {
      logger.error('Error processing Telegram message:', err);
    });
  }

  private extractAttachments(telegramMessage: any) {
    const attachments = [];

    if (telegramMessage.photo) {
      const photo = telegramMessage.photo[telegramMessage.photo.length - 1];
      attachments.push({
        type: 'image' as const,
        url: `https://api.telegram.org/file/bot${this.bot.token}/getFile?file_id=${photo.file_id}`,
        mime_type: 'image/jpeg',
      });
    }

    if (telegramMessage.document) {
      attachments.push({
        type: 'file' as const,
        url: `https://api.telegram.org/file/bot${this.bot.token}/getFile?file_id=${telegramMessage.document.file_id}`,
        filename: telegramMessage.document.file_name,
        mime_type: telegramMessage.document.mime_type,
      });
    }

    if (telegramMessage.video) {
      attachments.push({
        type: 'video' as const,
        url: `https://api.telegram.org/file/bot${this.bot.token}/getFile?file_id=${telegramMessage.video.file_id}`,
        mime_type: telegramMessage.video.mime_type,
      });
    }

    if (telegramMessage.audio) {
      attachments.push({
        type: 'audio' as const,
        url: `https://api.telegram.org/file/bot${this.bot.token}/getFile?file_id=${telegramMessage.audio.file_id}`,
        mime_type: telegramMessage.audio.mime_type,
      });
    }

    return attachments.length > 0 ? attachments : undefined;
  }

  async sendMessage(chatId: string, text: string): Promise<void> {
    try {
      logger.info('Sending Telegram message', { chatId, textLength: text.length });

      await this.bot.sendMessage(parseInt(chatId), text, {
        parse_mode: 'Markdown',
      });

      logger.info('Telegram message sent', { chatId });
    } catch (error) {
      logger.error('Failed to send Telegram message:', error);
      throw error;
    }
  }

  async sendInlineKeyboard(
    chatId: string,
    text: string,
    buttons: Array<{ text: string; callback_data: string }[]>
  ): Promise<void> {
    try {
      await this.bot.sendMessage(chatId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: buttons,
        },
      });
    } catch (error) {
      logger.error('Failed to send Telegram inline keyboard:', error);
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
      const me = await this.bot.getMe();
      return !!me;
    } catch (error) {
      logger.error('Telegram health check failed:', error);
      return false;
    }
  }
}
