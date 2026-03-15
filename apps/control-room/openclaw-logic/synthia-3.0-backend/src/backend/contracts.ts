export type InterfaceKind = 'http' | 'cli' | 'sdk';
export type DataClassification = 'public' | 'internal' | 'restricted';

export interface CapabilityManifest {
  id: string;
  name: string;
  version: string;
  provider: string;
  modulePath: string;
  description: string;
  tags: string[];
  interfaces: {
    kind: InterfaceKind;
    entrypoint: string;
  };
  economics: {
    baseCostUsd: number;
    avgLatencyMs: number;
  };
  security: {
    dataClassification: DataClassification;
    requiredScopes: string[];
  };
  tenancy: {
    supportsWhitelabel: boolean;
    supportsLocales: string[];
  };
}

export interface GoalRequest {
  objective: string;
  requiredTags: string[];
  preferredTags?: string[];
  maxCostUsd?: number;
  maxLatencyMs?: number;
  requiredScopes?: string[];
}

export interface CapabilitySelection {
  primary: CapabilityManifest;
  fallback: CapabilityManifest[];
  rationale: string;
}

export interface RuntimeEnvelope<TPayload = unknown> {
  eventId: string;
  correlationId: string;
  tenantId: string;
  source: string;
  type: string;
  timestamp: string;
  payload: TPayload;
}

export interface AdapterRequest {
  tenantId: string;
  goal: GoalRequest;
  input: Record<string, unknown>;
  correlationId: string;
}

export interface AdapterResponse {
  capabilityId: string;
  success: boolean;
  latencyMs: number;
  data: Record<string, unknown>;
  error?: string;
}
