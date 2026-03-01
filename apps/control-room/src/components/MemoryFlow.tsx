'use client';

import { useEffect, useState } from 'react';

interface MemoryCluster {
  id: string;
  context: string;
  count: number;
  similarity?: number;
}

interface MemoryFlowProps {
  events?: any[];
  onMemorySelect?: (memoryId: string) => void;
}

export default function MemoryFlow({ events = [], onMemorySelect }: MemoryFlowProps) {
  const [clusters, setClusters] = useState<MemoryCluster[]>([]);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);

  // Group memory events into clusters
  useEffect(() => {
    const clustered = events.reduce((acc: any, event: any) => {
      const key = event.type || 'unknown';
      if (!acc[key]) {
        acc[key] = {
          id: key,
          context: key,
          count: 0,
          similarity: Math.random(),
        };
      }
      acc[key].count++;
      return acc;
    }, {});

    setClusters(Object.values(clustered));
  }, [events]);

  const handleMemoryClick = (memoryId: string) => {
    setSelectedMemory(memoryId);
    onMemorySelect?.(memoryId);
  };

  return (
    <div className="rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">Memory Semantic Flow</h2>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Memory Clusters */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Memory Clusters</h3>
          {clusters.length > 0 ? (
            clusters.map((cluster) => (
              <div
                key={cluster.id}
                onClick={() => handleMemoryClick(cluster.id)}
                className={`cursor-pointer rounded border-l-4 p-3 transition-all ${
                  selectedMemory === cluster.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-purple-500 bg-purple-50 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{cluster.context}</p>
                    <p className="text-xs text-gray-600">{cluster.count} entries</p>
                  </div>
                  {cluster.similarity !== undefined && (
                    <div className="text-right">
                      <p className="text-xs font-bold">
                        {(cluster.similarity * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-gray-500">similarity</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No memory clusters</p>
          )}
        </div>

        {/* Semantic Relationships */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700">Relationships</h3>
          <div className="rounded-lg bg-gray-50 p-3">
            <svg className="h-32 w-full" viewBox="0 0 200 120">
              {/* Simple network diagram */}
              <circle cx="50" cy="30" r="8" fill="#8b5cf6" />
              <circle cx="100" cy="60" r="8" fill="#8b5cf6" />
              <circle cx="150" cy="30" r="8" fill="#8b5cf6" />
              <line x1="50" y1="30" x2="100" y2="60" stroke="#e0e7ff" strokeWidth="1" />
              <line x1="100" y1="60" x2="150" y2="30" stroke="#e0e7ff" strokeWidth="1" />
            </svg>
            <p className="text-center text-xs text-gray-500">Semantic distance network</p>
          </div>
        </div>
      </div>

      {selectedMemory && (
        <div className="mt-4 rounded-lg border-l-4 border-purple-500 bg-purple-50 p-4">
          <p className="text-sm">
            <strong>Selected Memory:</strong> {selectedMemory}
          </p>
          <p className="mt-1 text-xs text-gray-600">
            Showing {events.filter((e) => e.type === selectedMemory).length} related
            events
          </p>
        </div>
      )}
    </div>
  );
}
