import { Response, ChannelType, HeraldResponse } from '../types/index.js';
import { logger } from '../utils/logger.js';

export class ResponseRouter {
  formatForChannel(heraldResponse: HeraldResponse, channel: ChannelType, senderId: string): Response {
    const baseResponse: Response = {
      id: heraldResponse.response_id,
      channel,
      sender_id: senderId,
      text: this.truncateForChannel(heraldResponse.text, channel),
      timestamp: Date.now(),
    };

    switch (channel) {
      case 'whatsapp':
        return this.formatForWhatsApp(baseResponse, heraldResponse);
      case 'telegram':
        return this.formatForTelegram(baseResponse, heraldResponse);
      case 'slack':
        return this.formatForSlack(baseResponse, heraldResponse);
      case 'discord':
        return this.formatForDiscord(baseResponse, heraldResponse);
      case 'email':
        return this.formatForEmail(baseResponse, heraldResponse);
      case 'sms':
        return this.formatForSMS(baseResponse, heraldResponse);
      default:
        return baseResponse;
    }
  }

  private formatForWhatsApp(response: Response, heraldResponse: HeraldResponse): Response {
    return {
      ...response,
      text: this.addEmojis(response.text),
      quick_replies: this.createQuickReplies(heraldResponse),
      format: {
        whatsapp: {
          language_code: 'en',
        },
      },
    };
  }

  private formatForTelegram(response: Response, heraldResponse: HeraldResponse): Response {
    return {
      ...response,
      text: `*${heraldResponse.intent}*\n\n${response.text}`,
      format: {
        telegram: {
          parse_mode: 'Markdown',
        },
      },
    };
  }

  private formatForSlack(response: Response, heraldResponse: HeraldResponse): Response {
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: response.text,
        },
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `_Intent: ${heraldResponse.intent} | Confidence: ${(heraldResponse.confidence * 100).toFixed(0)}%_`,
          },
        ],
      },
    ];

    return {
      ...response,
      format: {
        slack: {
          blocks,
        },
      },
    };
  }

  private formatForDiscord(response: Response, heraldResponse: HeraldResponse): Response {
    return {
      ...response,
      format: {
        discord: {
          embeds: [
            {
              title: heraldResponse.intent.toUpperCase(),
              description: response.text,
              color: this.getColorForConfidence(heraldResponse.confidence),
              footer: {
                text: `Agent: ${heraldResponse.agent} | Confidence: ${(heraldResponse.confidence * 100).toFixed(0)}%`,
              },
            },
          ],
        },
      },
    };
  }

  private formatForEmail(response: Response, heraldResponse: HeraldResponse): Response {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>${heraldResponse.intent}</h2>
        <p>${response.text.replace(/\n/g, '<br>')}</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <small style="color: #999;">
          <strong>Agent:</strong> ${heraldResponse.agent}<br>
          <strong>Confidence:</strong> ${(heraldResponse.confidence * 100).toFixed(0)}%<br>
          <strong>Processing time:</strong> ${heraldResponse.execution_time_ms}ms
        </small>
      </div>
    `;

    return {
      ...response,
      text: response.text,
      format: {
        whatsapp: {
          language_code: 'en',
        },
      },
    };
  }

  private formatForSMS(response: Response, heraldResponse: HeraldResponse): Response {
    // SMS has 160 char limit, so truncate aggressively
    const smsText = response.text.substring(0, 150) + (response.text.length > 150 ? '...' : '');

    return {
      ...response,
      text: smsText,
    };
  }

  private truncateForChannel(text: string, channel: ChannelType): string {
    const limits: Record<ChannelType, number> = {
      whatsapp: 4096,
      telegram: 4096,
      slack: 3000,
      discord: 2000,
      email: 10000,
      sms: 160,
    };

    const limit = limits[channel];
    if (text.length > limit) {
      return text.substring(0, limit - 3) + '...';
    }
    return text;
  }

  private addEmojis(text: string): string {
    // Add contextual emojis based on keywords
    let result = text;
    const replacements: Record<string, string> = {
      'lead': '📊',
      'success': '✅',
      'error': '❌',
      'proposal': '📄',
      'email': '📧',
      'schedule': '📅',
      'user': '👤',
      'team': '👥',
      'update': '🔄',
    };

    Object.entries(replacements).forEach(([key, emoji]) => {
      const regex = new RegExp(`\\b${key}\\b`, 'gi');
      result = result.replace(regex, `${emoji} ${key}`);
    });

    return result;
  }

  private createQuickReplies(heraldResponse: HeraldResponse) {
    const replies = [];

    if (heraldResponse.intent.includes('lead')) {
      replies.push({ text: 'More details', payload: 'lead_details' });
      replies.push({ text: 'Next steps', payload: 'lead_next_steps' });
    }

    if (heraldResponse.intent.includes('question')) {
      replies.push({ text: 'More info', payload: 'more_info' });
      replies.push({ text: 'Contact us', payload: 'contact_us' });
    }

    if (replies.length === 0) {
      replies.push({ text: 'Got it', payload: 'acknowledge' });
    }

    return replies;
  }

  private getColorForConfidence(confidence: number): number {
    if (confidence >= 0.8) return 3066993; // green
    if (confidence >= 0.6) return 10181046; // yellow
    return 15158332; // red
  }
}
