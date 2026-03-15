import type {
  CapabilityManifest,
  CapabilitySelection,
  GoalRequest,
} from './contracts';
import { CapabilityRegistry } from './registry';

export class EconomicScheduler {
  score(manifest: CapabilityManifest, goal: GoalRequest): number {
    const tagBonus = goal.preferredTags?.reduce((acc, tag) => {
      return acc + (manifest.tags.includes(tag) ? 0.4 : 0);
    }, 0) ?? 0;

    const costPenalty = manifest.economics.baseCostUsd * 8;
    const latencyPenalty = manifest.economics.avgLatencyMs / 1500;
    return tagBonus - costPenalty - latencyPenalty;
  }
}

export class CapabilityPlanner {
  constructor(
    private readonly registry: CapabilityRegistry,
    private readonly scheduler: EconomicScheduler = new EconomicScheduler(),
  ) {}

  select(goal: GoalRequest): CapabilitySelection {
    const candidates = this.registry
      .byTags(goal.requiredTags)
      .filter((manifest) => this.satisfiesConstraints(manifest, goal));

    if (candidates.length === 0) {
      throw new Error('No capability satisfies the requested goal constraints.');
    }

    const ranked = [...candidates].sort(
      (a, b) => this.scheduler.score(b, goal) - this.scheduler.score(a, goal),
    );

    return {
      primary: ranked[0],
      fallback: ranked.slice(1, 3),
      rationale: `Selected ${ranked[0].id} from ${ranked.length} candidates using economic score.`,
    };
  }

  private satisfiesConstraints(manifest: CapabilityManifest, goal: GoalRequest): boolean {
    if (goal.maxCostUsd !== undefined && manifest.economics.baseCostUsd > goal.maxCostUsd) {
      return false;
    }

    if (goal.maxLatencyMs !== undefined && manifest.economics.avgLatencyMs > goal.maxLatencyMs) {
      return false;
    }

    if (!goal.requiredScopes || goal.requiredScopes.length === 0) {
      return true;
    }

    return goal.requiredScopes.every((scope) =>
      manifest.security.requiredScopes.includes(scope),
    );
  }
}
