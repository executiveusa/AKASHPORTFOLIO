/**
 * A2A-inspired internal contract — TaskReport types.
 * NOT full A2A protocol compliance. Internal use only.
 */

export type TaskStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'blocked_by_policy';

export interface TaskReport {
  /** Unique task identifier */
  id: string;
  /** Agent that executed the task */
  agentId: string;
  /** Task type / name */
  taskType: string;
  /** Current status */
  status: TaskStatus;
  /** Summary of task result */
  summary: string;
  /** Structured result data (redacted of secrets) */
  result?: Record<string, unknown>;
  /** Error message if failed */
  error?: string;
  /** ISO timestamp when task started */
  startedAt: string;
  /** ISO timestamp when task completed or failed */
  completedAt?: string;
  /** Correlation ID for tracing (e.g. Langfuse trace ID) */
  correlationId?: string;
  /** Requesting user email */
  requestedBy?: string;
}

export type CreateTaskReportInput = Omit<TaskReport, 'startedAt'>;

export function validateTaskReport(input: unknown): CreateTaskReportInput {
  if (!input || typeof input !== 'object') {
    throw new Error('INVALID_TASK_REPORT: must be an object');
  }
  const r = input as Record<string, unknown>;
  if (!r.id || typeof r.id !== 'string') throw new Error('INVALID_TASK_REPORT: id required');
  if (!r.agentId || typeof r.agentId !== 'string') throw new Error('INVALID_TASK_REPORT: agentId required');
  if (!r.taskType || typeof r.taskType !== 'string') throw new Error('INVALID_TASK_REPORT: taskType required');
  if (!r.status || typeof r.status !== 'string') throw new Error('INVALID_TASK_REPORT: status required');
  if (!r.summary || typeof r.summary !== 'string') throw new Error('INVALID_TASK_REPORT: summary required');
  return r as unknown as CreateTaskReportInput;
}
