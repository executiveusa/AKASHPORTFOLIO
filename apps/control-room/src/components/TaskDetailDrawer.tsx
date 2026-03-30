'use client';

import { useState } from 'react';

interface TaskDetailDrawerProps {
  task: {
    id: string;
    bead_id: string;
    title: string;
    owner_sphere: string;
    status: string;
    priority: string;
    cost_usd: number;
    created_at: string;
    updated_at: string;
    notes?: string;
  };
  sphereColor: string;
  onClose: () => void;
}

export default function TaskDetailDrawer({ task, sphereColor, onClose }: TaskDetailDrawerProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 380,
        maxWidth: '100vw',
        background: 'var(--color-charcoal-800)',
        borderLeft: '1px solid var(--color-charcoal-600)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid var(--color-charcoal-600)',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-cream-100)' }}>
          Detalle de Tarea
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-cream-400)',
            fontSize: 18,
            cursor: 'pointer',
            padding: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: 20, overflow: 'auto' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-cream-100)', marginBottom: 16, lineHeight: 1.4 }}>
          {task.title}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <DetailRow label="Bead ID" value={task.bead_id} mono />
          <DetailRow label="Sphere" value={task.owner_sphere} color={sphereColor} />
          <DetailRow label="Status" value={task.status} />
          <DetailRow label="Prioridad" value={task.priority} />
          <DetailRow label="Costo" value={`$${task.cost_usd.toFixed(2)} USD`} mono />
          <DetailRow label="Creado" value={task.created_at} mono />
          <DetailRow label="Actualizado" value={task.updated_at} mono />
        </div>

        {task.notes && (
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-cream-400)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
              Notas
            </div>
            <p style={{ fontSize: 14, color: 'var(--color-cream-200)', lineHeight: 1.6 }}>
              {task.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--color-cream-400)' }}>{label}</span>
      <span style={{
        fontSize: 13,
        fontWeight: 600,
        color: color || 'var(--color-cream-100)',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      }}>
        {value}
      </span>
    </div>
  );
}
