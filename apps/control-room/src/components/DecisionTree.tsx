'use client';

import { useState } from 'react';

interface Decision {
  id: string;
  question: string;
  answer: string;
  reasoning: string;
  timestamp: string;
  children?: Decision[];
}

interface DecisionTreeProps {
  decisions?: Decision[];
  expanded?: Set<string>;
  onToggle?: (id: string) => void;
}

export default function DecisionTree({
  decisions = [],
  expanded: initialExpanded,
  onToggle,
}: DecisionTreeProps) {
  const [expanded, setExpanded] = useState<Set<string>>(initialExpanded || new Set());

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
    onToggle?.(id);
  };

  const renderDecisionNode = (decision: Decision, depth = 0) => (
    <div key={decision.id} style={{ marginLeft: `${depth * 20}px` }}>
      <div
        onClick={() => toggleNode(decision.id)}
        className="my-2 cursor-pointer rounded border border-blue-300 bg-blue-50 p-3 transition-all hover:bg-blue-100"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {decision.children && decision.children.length > 0 && (
              <span className="mr-2 inline-block text-lg">
                {expanded.has(decision.id) ? '▼' : '▶'}
              </span>
            )}
            <div className="inline">
              <p className="font-semibold text-blue-900">{decision.question}</p>
              <p className="text-sm font-bold text-green-700">{decision.answer}</p>
              <p className="text-xs text-gray-600">{decision.reasoning}</p>
            </div>
          </div>
          <div className="ml-2 text-xs text-gray-500">
            {new Date(decision.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Render children if expanded */}
      {expanded.has(decision.id) &&
        decision.children &&
        decision.children.map((child) => renderDecisionNode(child, depth + 1))}
    </div>
  );

  return (
    <div className="rounded-lg border bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-bold">Decision Tree & Audit Log</h2>

      {decisions && decisions.length > 0 ? (
        <div className="space-y-2">
          {decisions.map((decision) => renderDecisionNode(decision))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-lg bg-gray-50 py-12">
          <p className="text-gray-500">No decisions recorded yet</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 border-t pt-4">
        <p className="mb-3 text-sm font-semibold text-gray-700">Legend:</p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-blue-500"></div>
            <span>Decision Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-green-500"></div>
            <span>Positive Outcome</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 bg-red-500"></div>
            <span>Negative Outcome</span>
          </div>
        </div>
      </div>
    </div>
  );
}
