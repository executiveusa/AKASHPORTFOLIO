import type { CapabilityManifest } from './contracts';
import { capabilityManifests } from './manifests';

export class CapabilityRegistry {
  private readonly manifests: Map<string, CapabilityManifest>;

  constructor(seed: CapabilityManifest[] = capabilityManifests) {
    this.manifests = new Map(seed.map((manifest) => [manifest.id, manifest]));
  }

  all(): CapabilityManifest[] {
    return Array.from(this.manifests.values());
  }

  getById(id: string): CapabilityManifest | undefined {
    return this.manifests.get(id);
  }

  byTags(tags: string[]): CapabilityManifest[] {
    if (tags.length === 0) return this.all();

    return this.all().filter((manifest) =>
      tags.every((tag) => manifest.tags.includes(tag)),
    );
  }

  upsert(manifest: CapabilityManifest): void {
    this.manifests.set(manifest.id, manifest);
  }
}
