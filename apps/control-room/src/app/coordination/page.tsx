'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import TaskGraph from '@/components/TaskGraph';
import MemoryFlow from '@/components/MemoryFlow';
import DecisionTree from '@/components/DecisionTree';
import { getTasksRecent, getMemoryEvents } from '@/lib/synthia-api';

export default function CoordinationPage() {
  const [activeTab, setActiveTab] = useState<'tasks' | 'memory' | 'decisions'>(
    'tasks'
  );
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);

  // Fetch data
  const { data: tasks } = useSWR('coordination-tasks', () => getTasksRecent(50), {
    refreshInterval: 10000,
  });

  const { data: memoryEvents } = useSWR(
    'coordination-memory',
    () => getMemoryEvents(100),
    { refreshInterval: 15000 }
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-4xl font-bold">Agent Coordination Dashboard</h1>
        <p className="text-gray-600">
          Real-time visualization of Agent Zero, OpenClaw, and Synthia coordination
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-2 border-b">
        {(['tasks', 'memory', 'decisions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'tasks'
              ? '🎯 Task Execution'
              : tab === 'memory'
                ? '🧠 Memory Flow'
                : '🌳 Decision Tree'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'tasks' && (
          <TaskGraph tasks={tasks} onTaskSelect={setSelectedTask} />
        )}

        {activeTab === 'memory' && (
          <MemoryFlow events={memoryEvents} onMemorySelect={setSelectedMemory} />
        )}

        {activeTab === 'decisions' && (
          <DecisionTree
            decisions={[
              {
                id: 'dec-1',
                question: 'Should delegate to Agent Zero?',
                answer: 'Yes',
                reasoning: 'Task complexity > 0.7 threshold',
                timestamp: new Date().toISOString(),
                children: [
                  {
                    id: 'dec-1-1',
                    question: 'Spawn OpenClaw sub-agents?',
                    answer: 'Yes',
                    reasoning: 'Parallel processing beneficial',
                    timestamp: new Date().toISOString(),
                    children: [],
                  },
                ],
              },
            ]}
          />
        )}
      </div>

      {/* Selected Item Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {selectedTask && (
          <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
            <h3 className="font-bold text-blue-900">Task Details</h3>
            <p className="mt-2 text-sm">
              <strong>ID:</strong> {selectedTask}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Click another task to view its details
            </p>
          </div>
        )}

        {selectedMemory && (
          <div className="rounded-lg border border-purple-300 bg-purple-50 p-4">
            <h3 className="font-bold text-purple-900">Memory Details</h3>
            <p className="mt-2 text-sm">
              <strong>Cluster:</strong> {selectedMemory}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Related memories from this semantic context
            </p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="rounded-lg bg-gray-50 p-4 text-center text-sm text-gray-600">
        <p>
          Active Tasks: {tasks?.length || 0} | Memory Events:{' '}
          {memoryEvents?.length || 0} | Last Updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
