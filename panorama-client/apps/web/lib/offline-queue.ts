import Dexie, { type Table } from "dexie";

interface QueuedOp {
  id?: number;
  type: "move_card" | "update_card" | "add_comment" | "add_issue";
  payload: Record<string, unknown>;
  createdAt: number;
  retries: number;
}

class PanoramaDB extends Dexie {
  ops!: Table<QueuedOp>;

  constructor() {
    super("panorama-offline");
    this.version(1).stores({ ops: "++id, type, createdAt" });
  }
}

const db = new PanoramaDB();

export async function enqueue(op: Omit<QueuedOp, "id" | "createdAt" | "retries">) {
  await db.ops.add({ ...op, createdAt: Date.now(), retries: 0 });
}

export async function flushQueue(
  flush: (op: QueuedOp) => Promise<void>
): Promise<void> {
  const ops = await db.ops.orderBy("createdAt").toArray();

  for (const op of ops) {
    try {
      await flush(op);
      await db.ops.delete(op.id!);
    } catch {
      await db.ops.update(op.id!, { retries: op.retries + 1 });
    }
  }
}

export async function queueSize(): Promise<number> {
  return db.ops.count();
}
