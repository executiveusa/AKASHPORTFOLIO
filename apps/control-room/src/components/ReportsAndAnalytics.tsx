"use client";

import { useState } from 'react';

export default function ReportsAndAnalytics() {
  const [selectedClient, setSelectedClient] = useState('Kupuri Media');

  const clients = [
    { name: 'Kupuri Media', color: 'emerald' },
    { name: 'Agencia Digital CDMX', color: 'blue' },
    { name: 'Coach Empresarial', color: 'purple' }
  ];

  const metrics = {
    'Kupuri Media': {
      tasksCompleted: 24,
      timeRecovered: '48 horas',
      roi: '3.2x',
      socialReach: '12.5K',
      engagementRate: '8.3%',
      avgResponseTime: '1.2 min'
    },
    'Agencia Digital CDMX': {
      tasksCompleted: 18,
      timeRecovered: '36 horas',
      roi: '2.8x',
      socialReach: '8.2K',
      engagementRate: '6.7%',
      avgResponseTime: '1.5 min'
    },
    'Coach Empresarial': {
      tasksCompleted: 12,
      timeRecovered: '24 horas',
      roi: '2.1x',
      socialReach: '5.3K',
      engagementRate: '7.2%',
      avgResponseTime: '0.9 min'
    }
  };

  const currentMetrics = metrics[selectedClient as keyof typeof metrics];

  const weeklyData = [
    { day: 'Lun', tasks: 4, engagement: 380 },
    { day: 'Mar', tasks: 5, engagement: 420 },
    { day: 'Mié', tasks: 6, engagement: 510 },
    { day: 'Jue', tasks: 5, engagement: 460 },
    { day: 'Vie', tasks: 7, engagement: 580 },
    { day: 'Sab', tasks: 2, engagement: 280 },
    { day: 'Dom', tasks: 1, engagement: 220 }
  ];

  const maxTasks = Math.max(...weeklyData.map(d => d.tasks));
  const maxEngagement = Math.max(...weeklyData.map(d => d.engagement));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
          <h3 className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">Reportes y Análitica</h3>
        </div>
      </div>

      {/* Client Selection */}
      <div className="flex gap-2 flex-wrap">
        {clients.map((client) => (
          <button
            key={client.name}
            onClick={() => setSelectedClient(client.name)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedClient === client.name
                ? `bg-${client.color}-600 text-white`
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/50'
            }`}
          >
            {client.name}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Tareas Completadas</p>
          <p className="text-3xl font-black text-emerald-400">{currentMetrics.tasksCompleted}</p>
          <p className="text-xs text-zinc-500 mt-2">Esta semana</p>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Tiempo Ahorrado</p>
          <p className="text-3xl font-black text-blue-400">{currentMetrics.timeRecovered}</p>
          <p className="text-xs text-zinc-500 mt-2">Liberado esta semana</p>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">ROI Estimado</p>
          <p className="text-3xl font-black text-yellow-400">{currentMetrics.roi}</p>
          <p className="text-xs text-zinc-500 mt-2">Retorno en inversión</p>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Alcance Social</p>
          <p className="text-3xl font-black text-purple-400">{currentMetrics.socialReach}</p>
          <p className="text-xs text-zinc-500 mt-2">Personas alcanzadas</p>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Engagement</p>
          <p className="text-3xl font-black text-cyan-400">{currentMetrics.engagementRate}</p>
          <p className="text-xs text-zinc-500 mt-2">Tasa de engagement</p>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Respuesta Promedio</p>
          <p className="text-3xl font-black text-pink-400">{currentMetrics.avgResponseTime}</p>
          <p className="text-xs text-zinc-500 mt-2">Tiempo de automatización</p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="p-6 bg-zinc-900/50 border border-zinc-700 rounded-lg">
        <h4 className="text-xs uppercase tracking-wider font-bold text-zinc-500 mb-6">Actividad Semanal</h4>

        <div className="space-y-6">
          {/* Tasks Chart */}
          <div>
            <p className="text-xs text-zinc-400 mb-3">Tareas Completadas</p>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-zinc-800 rounded-t-lg overflow-hidden">
                    <div
                      className="bg-gradient-to-t from-blue-500 to-cyan-400 w-full transition-all hover:opacity-80"
                      style={{ height: `${(data.tasks / maxTasks) * 100}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500">{data.day}</span>
                  <span className="text-xs font-bold text-blue-400">{data.tasks}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Engagement Chart */}
          <div className="pt-4 border-t border-zinc-700">
            <p className="text-xs text-zinc-400 mb-3">Engagement en Redes</p>
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full bg-zinc-800 rounded-t-lg overflow-hidden">
                    <div
                      className="bg-gradient-to-t from-purple-500 to-pink-400 w-full transition-all hover:opacity-80"
                      style={{ height: `${(data.engagement / maxEngagement) * 100}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-500">{data.day}</span>
                  <span className="text-xs font-bold text-purple-400">{data.engagement}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <button className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 rounded-lg font-semibold transition-all">
        📄 Descargar Reporte Completo (PDF)
      </button>
    </div>
  );
}
