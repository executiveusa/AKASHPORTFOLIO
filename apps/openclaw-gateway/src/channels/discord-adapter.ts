import { Router, Request, Response } from 'express';
import { Client, GatewayIntentBits, ChannelType as DiscordChannelType, TextChannel } from 'discord.js';
import { Message, ChannelType } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

export interface DiscordAdapterConfig {
  botToken: string;
  guildId?: string;
}

export class DiscordAdapter {
  private router: Router;
  private client: Client;
  private onMessageReceived?: (message: Message) => Promise<void>;

  constructor(config: DiscordAdapterConfig) {
    this.router = Router();

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.setupEventHandlers();
    this.client.login(config.botToken);
  }

  private setupEventHandlers() {
    this.client.on('messageCreate', async (discordMessage) => {
      if (discordMessage.author.bot) return;

      logger.info('Discord message received', {
        from: discordMessage.author.username,
        channel: discordMessage.channelId,
      });

      const openclawMessage: Message = {
        id: uuidv4(),
        channel: 'discord' as ChannelType,
        sender_id: discordMessage.author.id,
        sender_name: discordMessage.author.username,
        text: discordMessage.content,
        attachments: this.extractAttachments(discordMessage),
        metadata: {
          discord_message_id: discordMessage.id,
          discord_channel_id: discordMessage.channelId,
          discord_guild_id: discordMessage.guildId,
          discord_thread_id: discordMessage.threadId,
        },
        timestamp: discordMessage.createdTimestamp,
      };

      this.onMessageReceived?.(openclawMessage).catch((err) => {
        logger.error('Error processing Discord message:', err);
      });
    });

    this.client.on('ready', () => {
      logger.info('Discord bot connected', { username: this.client.user?.username });
    });

    this.client.on('error', (error) => {
      logger.error('Discord client error:', error);
    });
  }

  private extractAttachments(discordMessage: any) {
    const attachments = [];

    if (discordMessage.attachments && discordMessage.attachments.size > 0) {
      discordMessage.attachments.forEach((attachment: any) => {
        const type = this.getAttachmentType(attachment.contentType);
        attachments.push({
          type,
          url: attachment.url,
          filename: attachment.name,
          mime_type: attachment.contentType,
        });
      });
    }

    return attachments.length > 0 ? attachments : undefined;
  }

  private getAttachmentType(contentType: string): 'image' | 'video' | 'audio' | 'file' {
    if (contentType?.startsWith('image')) return 'image';
    if (contentType?.startsWith('video')) return 'video';
    if (contentType?.startsWith('audio')) return 'audio';
    return 'file';
  }

  async sendMessage(channelId: string, text: string): Promise<void> {
    try {
      const channel = (await this.client.channels.fetch(channelId)) as TextChannel;
      if (!channel || channel.type !== DiscordChannelType.GuildText) {
        throw new Error('Channel not found or not a text channel');
      }

      logger.info('Sending Discord message', { channelId, textLength: text.length });

      // Discord has a 2000 character limit per message
      if (text.length > 2000) {
        const chunks = text.match(/[\s\S]{1,2000}/g) || [];
        for (const chunk of chunks) {
          await channel.send(chunk);
        }
      } else {
        await channel.send(text);
      }

      logger.info('Discord message sent', { channelId });
    } catch (error) {
      logger.error('Failed to send Discord message:', error);
      throw error;
    }
  }

  async sendEmbed(channelId: string, embedData: any): Promise<void> {
    try {
      const channel = (await this.client.channels.fetch(channelId)) as TextChannel;
      if (!channel || channel.type !== DiscordChannelType.GuildText) {
        throw new Error('Channel not found or not a text channel');
      }

      await channel.send({ embeds: [embedData] });

      logger.info('Discord embed sent', { channelId });
    } catch (error) {
      logger.error('Failed to send Discord embed:', error);
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
      return this.client.isReady();
    } catch (error) {
      logger.error('Discord health check failed:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    await this.client.destroy();
  }
}
