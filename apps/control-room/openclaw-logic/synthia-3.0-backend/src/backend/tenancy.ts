export type Locale = 'en' | 'es';

export interface TenantConfig {
  id: string;
  name: string;
  defaultLocale: Locale;
  enabledCapabilities: string[];
  featureFlags: Record<string, boolean>;
  limits: {
    monthlyTaskBudgetUsd: number;
    maxLatencyMs: number;
  };
}

export class TenantConfigStore {
  private readonly configs = new Map<string, TenantConfig>();

  constructor(seed: TenantConfig[] = []) {
    seed.forEach((config) => this.configs.set(config.id, config));
  }

  get(tenantId: string): TenantConfig {
    const config = this.configs.get(tenantId);
    if (!config) {
      throw new Error(`Unknown tenant: ${tenantId}`);
    }

    return config;
  }

  upsert(config: TenantConfig): void {
    this.configs.set(config.id, config);
  }

  isCapabilityEnabled(tenantId: string, capabilityId: string): boolean {
    return this.get(tenantId).enabledCapabilities.includes(capabilityId);
  }
}

export const defaultTenants: TenantConfig[] = [
  {
    id: 'kupuri-default',
    name: 'Kupuri Default Tenant',
    defaultLocale: 'es',
    enabledCapabilities: [
      'aionui.assistant.surface',
      'postiz.social.automation',
      'gastown.content.pipeline',
      'pauli.story.toolkit',
    ],
    featureFlags: {
      adaptivePlanner: true,
      telemetryDeepTrace: true,
      whitelabelThemeV1: true,
    },
    limits: {
      monthlyTaskBudgetUsd: 500,
      maxLatencyMs: 1500,
    },
  },
];
