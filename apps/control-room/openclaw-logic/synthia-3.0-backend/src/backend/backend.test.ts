import { describe, expect, it } from 'vitest';
import {
  AdapterRouter,
  CapabilityPlanner,
  CapabilityRegistry,
  EventBus,
  SynthiaCapabilityFabric,
  capabilityManifests,
} from './index';

describe('capability registry', () => {
  it('returns manifests and supports tag filtering', () => {
    const registry = new CapabilityRegistry();
    expect(registry.all().length).toBeGreaterThanOrEqual(4);

    const social = registry.byTags(['social']);
    expect(social.some((capability) => capability.id === 'postiz.social.automation')).toBe(true);
  });
});

describe('capability planner', () => {
  it('selects a capability under constraints', () => {
    const planner = new CapabilityPlanner(new CapabilityRegistry());
    const selected = planner.select({
      objective: 'Publish weekly social campaign',
      requiredTags: ['social'],
      preferredTags: ['automation'],
      maxCostUsd: 0.02,
      maxLatencyMs: 1200,
      requiredScopes: ['capability:postiz:execute'],
    });

    expect(selected.primary.id).toBe('postiz.social.automation');
    expect(selected.rationale).toContain('Selected');
  });
});

describe('adapter router', () => {
  it('registers default adapters for manifests', async () => {
    const router = new AdapterRouter();
    router.registerDefaults(capabilityManifests);

    const adapter = router.resolve('aionui.assistant.surface');
    const response = await adapter.execute({
      tenantId: 'kupuri-default',
      correlationId: 'corr-1',
      goal: {
        objective: 'Design a guided assistant flow',
        requiredTags: ['assistant'],
      },
      input: { prompt: 'test' },
    });

    expect(response.success).toBe(true);
    expect(response.capabilityId).toBe('aionui.assistant.surface');
  });
});

describe('runtime event bus', () => {
  it('publishes and stores history', () => {
    const eventBus = new EventBus();
    let observed = 0;

    eventBus.subscribe('capability.execution.completed', () => {
      observed += 1;
    });

    eventBus.publish({
      eventId: 'evt-1',
      correlationId: 'corr-1',
      tenantId: 'kupuri-default',
      source: 'test',
      type: 'capability.execution.completed',
      timestamp: new Date().toISOString(),
      payload: { ok: true },
    });

    expect(observed).toBe(1);
    expect(eventBus.history()).toHaveLength(1);
  });
});

describe('synthia capability fabric', () => {
  it('runs orchestration end-to-end for tenant-enabled capability', async () => {
    const fabric = new SynthiaCapabilityFabric();
    const result = await fabric.run({
      tenantId: 'kupuri-default',
      correlationId: 'corr-e2e-1',
      goal: {
        objective: 'Build social posting plan',
        requiredTags: ['social'],
        preferredTags: ['automation'],
      },
      input: {
        month: 'March',
      },
    });

    expect(result.selection.primary).toBe('postiz.social.automation');
    expect(result.response.success).toBe(true);
    expect(fabric.diagnostics().history.length).toBeGreaterThan(0);
  });
});
