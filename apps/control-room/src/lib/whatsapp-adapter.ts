/**
 * WhatsApp Community Bridge Adapter
 * Integrates Twilio WhatsApp API with Synthia Council
 */

interface WhatsAppMessage {
  from: string;
  to: string;
  text: string;
  timestamp: string;
  messageId: string;
}

interface WhatsAppResponse {
  to: string;
  messageId: string;
  timestamp: string;
}

export class WhatsAppAdapter {
  private accountSid: string;
  private authToken: string;
  private fromNumber: string;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';
  }

  /**
   * Send message to WhatsApp user
   */
  async sendMessage(to: string, text: string): Promise<WhatsAppResponse> {
    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            From: `whatsapp:${this.fromNumber}`,
            To: `whatsapp:${to}`,
            Body: text,
          }).toString(),
        }
      );

      const data = await response.json() as any;

      return {
        to,
        messageId: data.sid,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('WhatsApp send error:', error);
      throw error;
    }
  }

  /**
   * Broadcast council decision to community
   */
  async broadcastDecision(recipients: string[], decision: string): Promise<WhatsAppResponse[]> {
    const results: WhatsAppResponse[] = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendMessage(recipient, decision);
        results.push(result);
      } catch (error) {
        console.error(`Failed to send to ${recipient}:`, error);
      }
    }

    return results;
  }

  /**
   * Extract sentiment from WhatsApp message
   */
  extractSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveKeywords = ['bueno', 'excelente', 'increíble', 'great', 'awesome', 'love'];
    const negativeKeywords = ['malo', 'horrible', 'terrible', 'hate', 'bad', 'awful'];

    const lowerText = text.toLowerCase();

    if (positiveKeywords.some(kw => lowerText.includes(kw))) {
      return 'positive';
    }
    if (negativeKeywords.some(kw => lowerText.includes(kw))) {
      return 'negative';
    }

    return 'neutral';
  }

  /**
   * Check if message should trigger council meeting
   */
  shouldTriggerCouncil(text: string): boolean {
    const triggerKeywords = [
      'consejo', 'council', 'pregunta', 'question', 'ayuda', 'help',
      'opinión', 'opinion', 'decide', 'decision',
    ];

    return triggerKeywords.some(kw => text.toLowerCase().includes(kw));
  }
}

export default new WhatsAppAdapter();
