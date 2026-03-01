'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import {
  getDashboardSummary,
  getTasksRecent,
  getMemoryEvents,
  subscribeToMetrics,
} from '@/lib/synthia-api';

interface KPIs {
  active_tasks: number;
  memory_entries: number;
  api_health: string;
  uptime_seconds: number;
}

export default function RealtimeDashboard() {
  const [kpis, setKpis] = useState<KPIs>({
    active_tasks: 0,
    memory_entries: 0,
    api_health: 'loading',
    uptime_seconds: 0,
  });
  const [metrics, setMetrics] = useState('');

  // Fetch dashboard data every 5 seconds
  const { data: summary, isLoading: summaryLoading } = useSWR(
    'dashboard-summary',
    getDashboardSummary,
    { refreshInterval: 5000 }
  );

  // Fetch recent tasks
  const { data: tasks } = useSWR(
    'recent-tasks',
    () => getTasksRecent(10),
    { refreshInterval: 10000 }
  );

  // Fetch memory events
  const { data: memoryEvents } = useSWR(
    'memory-events',
    () => getMemoryEvents(20),
    { refreshInterval: 10000 }
  );

  // Subscribe to metrics stream
  useEffect(() => {
    const unsubscribe = subscribeToMetrics(
      (data) => {
        setMetrics(data);
      },
      (error) => {
        console.error('Metrics subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Update KPIs when summary changes
  useEffect(() => {
    if (summary?.kpis) {
      setKpis(summary.kpis);
    }
  }, [summary]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Synthia 3.0 Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Active Tasks</div>
          <div className="mt-2 text-3xl font-bold">{kpis.active_tasks}</div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Memory Entries</div>
          <div className="mt-2 text-3xl font-bold">{kpis.memory_entries}</div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow">
          <div className="text-sm text-gray-500">API Health</div>
          <div
            className={`mt-2 text-xl font-bold ${
              kpis.api_health === 'healthy'
                ? 'text-green-600'
                : kpis.api_health === 'error'
                  ? 'text-red-600'
                  : 'text-yellow-600'
            }`}
          >
            {kpis.api_health}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Uptime</div>
          <div className="mt-2 text-lg font-bold">
            {Math.floor(kpis.uptime_seconds / 3600)}h
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">Recent Tasks</h2>
        {tasks && tasks.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left">Task ID</th>
                <th className="text-left">Status</th>
                <th className="text-left">Duration</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => (
                <tr key={task.id} className="border-b">
                  <td className="py-2 font-mono text-xs">{task.id.slice(0, 8)}...</td>
                  <td>
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${
                        task.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </td>
                  <td>{task.duration_ms}ms</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No tasks yet</p>
        )}
      </div>

      {/* Memory Events */}
      <div className="rounded-lg border bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-bold">Memory Operations</h2>
        {memoryEvents && memoryEvents.length > 0 ? (
          <div className="space-y-2">
            {memoryEvents.slice(0, 10).map((event) => (
              <div key={event.id} className="flex justify-between border-b pb-2 text-sm">
                <span className="font-mono text-xs">{event.type}</span>
                <span className="text-gray-500">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No memory events</p>
        )}
      </div>

      {/* Raw Metrics */}
      <div className="rounded-lg border bg-gray-900 p-6 shadow font-mono text-xs text-green-400">
        <h2 className="mb-4 font-bold text-white">Prometheus Metrics</h2>
        <pre className="overflow-x-auto whitespace-pre-wrap break-words">
          {metrics
            ? metrics.split('\n').slice(0, 20).join('\n')
            : 'Loading metrics...'}
        </pre>
      </div>
    </div>
  );
}
