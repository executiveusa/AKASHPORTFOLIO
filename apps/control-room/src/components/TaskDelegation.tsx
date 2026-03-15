"use client";

import { useState } from 'react';

export default function TaskDelegation() {
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Generate Social Media Posts',
      agent: 'Agent-Alpha',
      status: 'running',
      progress: 65,
      deadline: '2026-03-05'
    },
    {
      id: '2',
      title: 'Email Campaign - Q1 Planning',
      agent: 'Agent-Beta',
      status: 'completed',
      progress: 100,
      deadline: '2026-03-03'
    },
    {
      id: '3',
      title: 'Lead Research - Tech Companies',
      agent: 'Agent-Gamma',
      status: 'pending',
      progress: 0,
      deadline: '2026-03-06'
    }
  ]);

  const [showNewTask, setShowNewTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    agent: 'auto',
    deadline: ''
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-900/30 border-emerald-500/30 text-emerald-400';
      case 'running': return 'bg-blue-900/30 border-blue-500/30 text-blue-400';
      case 'pending': return 'bg-amber-900/30 border-amber-500/30 text-amber-400';
      default: return 'bg-zinc-800/30 border-zinc-700/30 text-zinc-400';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada';
      case 'running': return 'En Progreso';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  const handleNewTask = () => {
    if (newTask.title && newTask.agent && newTask.deadline) {
      const task = {
        id: Math.random().toString(36).substr(2, 9),
        title: newTask.title,
        agent: newTask.agent === 'auto' ? 'Agent-Auto' : newTask.agent,
        status: 'pending' as const,
        progress: 0,
        deadline: newTask.deadline
      };
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', agent: 'auto', deadline: '' });
      setShowNewTask(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Delegación de Tareas</h3>
        </div>
        <button
          onClick={() => setShowNewTask(!showNewTask)}
          className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          + Nueva Tarea
        </button>
      </div>

      {showNewTask && (
        <div className="p-6 bg-zinc-900/50 border border-zinc-700 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Título de la tarea"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
            />
            <select
              value={newTask.agent}
              onChange={(e) => setNewTask({ ...newTask, agent: e.target.value })}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
            >
              <option value="auto">Asignar Automáticamente</option>
              <option value="agent-alpha">Agent-Alpha</option>
              <option value="agent-beta">Agent-Beta</option>
              <option value="agent-gamma">Agent-Gamma</option>
            </select>
          </div>
          <textarea
            placeholder="Descripción de la tarea"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm mb-4"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-white text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleNewTask}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-semibold transition-colors"
            >
              Crear Tarea
            </button>
            <button
              onClick={() => setShowNewTask(false)}
              className="flex-1 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-sm font-semibold transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={`p-4 border rounded-lg transition-colors ${getStatusColor(task.status)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm">{task.title}</h4>
                <p className="text-xs text-zinc-400 mt-1">{task.agent}</p>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-black/30 rounded">
                {getStatusLabel(task.status)}
              </span>
            </div>

            {task.status !== 'pending' && (
              <>
                <div className="w-full bg-black/30 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-xs text-zinc-400">
                  <span>{task.progress}%</span>
                  <span>Vence: {task.deadline}</span>
                </div>
              </>
            )}

            {task.status === 'pending' && (
              <div className="text-xs text-zinc-400">
                Vence: {task.deadline}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
