import type { RuntimeEnvelope } from './contracts';

export interface DispatchRecord {
  key: string;
  envelope: RuntimeEnvelope;
}

export class IdempotencyStore {
  private readonly seen = new Map<string, RuntimeEnvelope>();

  has(key: string): boolean {
    return this.seen.has(key);
  }

  remember(key: string, envelope: RuntimeEnvelope): void {
    this.seen.set(key, envelope);
  }

  get(key: string): RuntimeEnvelope | undefined {
    return this.seen.get(key);
  }
}

export class EventBus {
  private readonly subscribers = new Map<string, Array<(envelope: RuntimeEnvelope) => void>>();
  private readonly log: DispatchRecord[] = [];

  subscribe(type: string, handler: (envelope: RuntimeEnvelope) => void): () => void {
    const handlers = this.subscribers.get(type) ?? [];
    handlers.push(handler);
    this.subscribers.set(type, handlers);

    return () => {
      const current = this.subscribers.get(type) ?? [];
      this.subscribers.set(
        type,
        current.filter((candidate) => candidate !== handler),
      );
    };
  }

  publish(envelope: RuntimeEnvelope): void {
    this.log.push({ key: envelope.eventId, envelope });
    const handlers = this.subscribers.get(envelope.type) ?? [];
    handlers.forEach((handler) => handler(envelope));
  }

  history(): DispatchRecord[] {
    return [...this.log];
  }
}

export class MemoryLayer {
  private readonly memory = new Map<string, Map<string, unknown>>();

  set(tenantId: string, key: string, value: unknown): void {
    const tenantMemory = this.memory.get(tenantId) ?? new Map<string, unknown>();
    tenantMemory.set(key, value);
    this.memory.set(tenantId, tenantMemory);
  }

  get<TValue = unknown>(tenantId: string, key: string): TValue | undefined {
    return this.memory.get(tenantId)?.get(key) as TValue | undefined;
  }
}
