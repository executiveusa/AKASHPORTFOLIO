/**
 * Synthia 3.0 API Client
 * Connects Control Room frontend to Synthia backend
 */

const SYNTHIA_BACKEND_URL =
  process.env.NEXT_PUBLIC_SYNTHIA_BACKEND_URL || 'http://localhost:42617';

export interface Task {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  title: string;
  duration_ms: number;
}

export interface MemoryEvent {
  id: string;
  type: 'add' | 'search' | 'retrieve';
  timestamp: string;
}

export interface DashboardSummary {
  kpis: {
    active_tasks: number;
    memory_entries: number;
    api_health: string;
    uptime_seconds: number;
  };
  timestamp: string;
}

/**
 * Fetch Prometheus metrics from Synthia backend
 */
export async function fetchMetrics(): Promise<string> {
  try {
    const response = await fetch(`${SYNTHIA_BACKEND_URL}/metrics`, {
      method: 'GET',
      headers: { 'Content-Type': 'text/plain' },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return '# Error fetching metrics\n';
  }
}

/**
 * Get recent Agent Zero tasks
 */
export async function getTasksRecent(limit = 50): Promise<Task[]> {
  try {
    const response = await fetch(
      `${SYNTHIA_BACKEND_URL}/api/tasks/recent?limit=${limit}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.tasks || [];
  } catch (error) {
    console.error('Failed to fetch recent tasks:', error);
    return [];
  }
}

/**
 * Get recent memory operations
 */
export async function getMemoryEvents(limit = 100): Promise<MemoryEvent[]> {
  try {
    const response = await fetch(
      `${SYNTHIA_BACKEND_URL}/api/memory/events?limit=${limit}`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Failed to fetch memory events:', error);
    return [];
  }
}

/**
 * Get real-time dashboard KPI snapshot
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const response = await fetch(
      `${SYNTHIA_BACKEND_URL}/api/dashboard/summary`
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch dashboard summary:', error);
    return {
      kpis: {
        active_tasks: 0,
        memory_entries: 0,
        api_health: 'error',
        uptime_seconds: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Stream metrics updates via SSE
 */
export function subscribeToMetrics(
  onData: (metrics: string) => void,
  onError?: (error: Error) => void
): () => void {
  try {
    const eventSource = new EventSource(`${SYNTHIA_BACKEND_URL}/metrics`);

    eventSource.onmessage = (event) => {
      onData(event.data);
    };

    eventSource.onerror = () => {
      const error = new Error('Metrics stream disconnected');
      onError?.(error);
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    onError?.(err);
    return () => {};
  }
}

/**
 * Check Synthia backend health
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${SYNTHIA_BACKEND_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}
