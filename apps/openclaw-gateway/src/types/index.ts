export type ChannelType = 'whatsapp' | 'telegram' | 'slack' | 'discord' | 'email' | 'sms';

export interface Message {
  id: string;
  channel: ChannelType;
  sender_id: string;
  sender_name?: string;
  text: string;
  attachments?: Attachment[];
  metadata?: Record<string, any>;
  timestamp: number;
}

export interface Attachment {
  type: 'image' | 'video' | 'audio' | 'file' | 'document';
  url: string;
  filename?: string;
  mime_type?: string;
}

export interface Response {
  id: string;
  channel: ChannelType;
  sender_id: string;
  text: string;
  attachments?: Attachment[];
  quick_replies?: QuickReply[];
  format?: ChannelFormat;
  timestamp: number;
}

export interface QuickReply {
  text: string;
  payload?: string;
}

export interface ChannelFormat {
  whatsapp?: WhatsAppFormat;
  telegram?: TelegramFormat;
  slack?: SlackFormat;
  discord?: DiscordFormat;
}

export interface WhatsAppFormat {
  template_name?: string;
  language_code?: string;
}

export interface TelegramFormat {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  reply_markup?: any;
}

export interface SlackFormat {
  blocks?: any[];
  thread_ts?: string;
}

export interface DiscordFormat {
  embeds?: any[];
  components?: any[];
}

export interface Session {
  id: string;
  user_id: string;
  channel: ChannelType;
  created_at: number;
  updated_at: number;
  context: ConversationContext;
  metadata: Record<string, any>;
}

export interface ConversationContext {
  history: ConversationMessage[];
  intent?: string;
  confidence?: number;
  last_intent_classification?: {
    timestamp: number;
    intent: string;
    confidence: number;
  };
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  intent?: string;
}

export interface HeraldRequest {
  session_id: string;
  message: Message;
  context: ConversationContext;
  channel: ChannelType;
}

export interface HeraldResponse {
  response_id: string;
  text: string;
  confidence: number;
  intent: string;
  agent: string;
  skills_used: string[];
  execution_time_ms: number;
}

export interface EventBridgePayload {
  type: 'message_received' | 'session_started' | 'session_ended' | 'error';
  payload: any;
  timestamp: number;
}

export interface ChannelConfig {
  type: ChannelType;
  enabled: boolean;
  credentials?: Record<string, string>;
  webhook_url?: string;
  retry_policy?: RetryPolicy;
}

export interface RetryPolicy {
  max_retries: number;
  initial_delay_ms: number;
  max_delay_ms: number;
  backoff_multiplier: number;
}
