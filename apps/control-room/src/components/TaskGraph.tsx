'use client';

import { useEffect, useState } from 'react';

interface TaskNode {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
}

interface TaskGraphProps {
  tasks?: TaskNode[];
  onTaskSelect?: (taskId: string) => void;
}

export default function TaskGraph({ tasks = [], onTaskSelect }: TaskGraphProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  const handleTaskClick = (taskId: string) => {
    setSelectedTask(taskId);
    onTaskSelect?.(taskId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-500 text-green-900';
      case 'failed':
        return 'bg-red-100 border-red-500 text-red-900';
      case 'running':
        return 'bg-blue-100 border-blue-500 text-blue-900';
      case 'pending':
        return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      default:
        return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">Task Execution Graph</h2>

      {tasks && tasks.length > 0 ? (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => handleTaskClick(task.id)}
              className={`cursor-pointer rounded border-2 p-3 transition-all ${getStatusColor(
                task.status
              )} ${selectedTask === task.id ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{task.title}</h3>
                  <p className="text-xs opacity-75">{task.id.slice(0, 8)}...</p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded bg-white px-2 py-1 text-xs font-bold">
                    {task.status}
                  </span>
                  {task.duration && (
                    <p className="text-xs opacity-75">{task.duration}ms</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg bg-gray-50 py-12">
          <p className="text-gray-500">No tasks to display</p>
        </div>
      )}

      {selectedTask && (
        <div className="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
          <p className="text-sm text-gray-600">
            <strong>Selected Task:</strong> {selectedTask}
          </p>
        </div>
      )}
    </div>
  );
}
