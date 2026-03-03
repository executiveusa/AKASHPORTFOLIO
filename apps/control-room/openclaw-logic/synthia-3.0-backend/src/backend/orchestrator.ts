import type { AdapterResponse, GoalRequest, RuntimeEnvelope } from './contracts';
import { AdapterRouter } from './adapters';
import { CapabilityPlanner } from './planner';
import { CapabilityRegistry } from './registry';
import { EventBus, IdempotencyStore, MemoryLayer } from './runtime';
import { StructuredLogger, withRetries } from './telemetry';
import { TenantConfigStore, defaultTenants } from './tenancy';

export interface OrchestrationRequest {
  tenantId: string;
  correlationId: string;
  goal: GoalRequest;
  input: Record<string, unknown>;
}

export interface OrchestrationResult {
  selection: {
    primary: string;
    fallback: string[];
    rationale: string;
  };
  response: AdapterResponse;
}

export class SynthiaCapabilityFabric {
  private readonly registry = new CapabilityRegistry();
  private readonly planner = new CapabilityPlanner(this.registry);
  private readonly router = new AdapterRouter();
  private readonly idempotency = new IdempotencyStore();
  private readonly events = new EventBus();
  private readonly memory = new MemoryLayer();
  private readonly logger = new StructuredLogger();
  private readonly tenants = new TenantConfigStore(defaultTenants);

  constructor() {
    this.router.registerDefaults(this.registry.all());
  }

  async run(request: OrchestrationRequest): Promise<OrchestrationResult> {
    const tenant = this.tenants.get(request.tenantId);
    const eventKey = `${request.tenantId}:${request.correlationId}:${request.goal.objective}`;

    if (this.idempotency.has(eventKey)) {
      this.logger.info('Idempotent replay detected; using previous event.', {
        eventKey,
      });
    }

    const selection = this.planner.select({
      ...request.goal,
      maxLatencyMs: Math.min(request.goal.maxLatencyMs ?? Infinity, tenant.limits.maxLatencyMs),
    });

    if (!this.tenants.isCapabilityEnabled(request.tenantId, selection.primary.id)) {
      throw new Error(`Capability ${selection.primary.id} disabled for tenant ${request.tenantId}`);
    }

    const adapter = this.router.resolve(selection.primary.id);
    const response = await withRetries(
      () =>
        adapter.execute({
          correlationId: request.correlationId,
          tenantId: request.tenantId,
          goal: request.goal,
          input: request.input,
        }),
      this.logger,
    );

    const envelope: RuntimeEnvelope<AdapterResponse> = {
      eventId: eventKey,
      correlationId: request.correlationId,
      tenantId: request.tenantId,
      source: 'synthia-capability-fabric',
      type: 'capability.execution.completed',
      timestamp: new Date().toISOString(),
      payload: response,
    };

    this.events.publish(envelope);
    this.idempotency.remember(eventKey, envelope);
    this.memory.set(request.tenantId, `last:${request.goal.objective}`, response);

    return {
      selection: {
        primary: selection.primary.id,
        fallback: selection.fallback.map((item) => item.id),
        rationale: selection.rationale,
      },
      response,
    };
  }

  diagnostics() {
    return {
      logs: this.logger.snapshot(),
      history: this.events.history(),
    };
  }
}
