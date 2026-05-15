export type TaskReport = { taskId: string; status: 'queued'|'running'|'completed'|'failed'; summary?: string };
