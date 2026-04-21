import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('localhost'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  // HERALD Configuration
  HERALD_URL: z.string().default('http://localhost:4200'),
  HERALD_API_KEY: z.string().optional(),

  // WhatsApp Configuration
  WHATSAPP_ENABLED: z.enum(['true', 'false']).default('false'),
  WHATSAPP_ACCOUNT_SID: z.string().optional(),
  WHATSAPP_AUTH_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER: z.string().optional(),
  WHATSAPP_WEBHOOK_TOKEN: z.string().optional(),

  // Telegram Configuration
  TELEGRAM_ENABLED: z.enum(['true', 'false']).default('false'),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_WEBHOOK_URL: z.string().optional(),

  // Slack Configuration
  SLACK_ENABLED: z.enum(['true', 'false']).default('false'),
  SLACK_BOT_TOKEN: z.string().optional(),
  SLACK_SIGNING_SECRET: z.string().optional(),

  // Discord Configuration
  DISCORD_ENABLED: z.enum(['true', 'false']).default('false'),
  DISCORD_BOT_TOKEN: z.string().optional(),
  DISCORD_GUILD_ID: z.string().optional(),

  // Database Configuration
  DATABASE_PATH: z.string().default('./sessions.db'),

  // Session Configuration
  SESSION_EXPIRY_HOURS: z.coerce.number().default(24),
  MAX_HISTORY_MESSAGES: z.coerce.number().default(50),
});

export type EnvConfig = z.infer<typeof envSchema>;

let config: EnvConfig | null = null;

export function loadConfig(): EnvConfig {
  if (config) return config;

  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten());
    process.exit(1);
  }

  config = parsed.data;
  return config;
}

export function getConfig(): EnvConfig {
  if (!config) {
    return loadConfig();
  }
  return config;
}
