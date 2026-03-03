import type { AdapterRequest, AdapterResponse, CapabilityManifest } from './contracts';

export interface CapabilityAdapter {
  readonly capabilityId: string;
  execute(request: AdapterRequest): Promise<AdapterResponse>;
}

class StaticAdapter implements CapabilityAdapter {
  constructor(public readonly capabilityId: string, private readonly provider: string) {}

  async execute(request: AdapterRequest): Promise<AdapterResponse> {
    const latencyMs = Math.max(35, Math.min(400, request.goal.maxLatencyMs ?? 120));

    return {
      capabilityId: this.capabilityId,
      success: true,
      latencyMs,
      data: {
        provider: this.provider,
        objective: request.goal.objective,
        tenantId: request.tenantId,
        acceptedTags: request.goal.requiredTags,
      },
    };
  }
}

export class AdapterRouter {
  private readonly adapters = new Map<string, CapabilityAdapter>();

  register(adapter: CapabilityAdapter): void {
    this.adapters.set(adapter.capabilityId, adapter);
  }

  resolve(capabilityId: string): CapabilityAdapter {
    const adapter = this.adapters.get(capabilityId);
    if (!adapter) {
      throw new Error(`No adapter registered for capability ${capabilityId}`);
    }

    return adapter;
  }

  registerDefaults(manifests: CapabilityManifest[]): void {
    manifests.forEach((manifest) => {
      this.register(new StaticAdapter(manifest.id, manifest.provider));
    });
  }
}
