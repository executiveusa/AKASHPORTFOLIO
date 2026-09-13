'use client';

/**
 * ModelSwitcher — one quiet select in the chat header. Free models first; paid ones marked.
 * Persists the choice in localStorage('synthia_model'); callers read it via useSelectedModel().
 */
import { useEffect, useState } from 'react';
import { CATALOG, DEFAULT_MODEL } from '@/lib/models';

const KEY = 'synthia_model';

export function useSelectedModel(): [string, (id: string) => void] {
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem(KEY) : null;
    if (saved) setModel(saved);
  }, []);
  const set = (id: string) => { setModel(id); try { window.localStorage.setItem(KEY, id); } catch { /* ignore */ } };
  return [model, set];
}

interface Option { id: string; label: string; free: boolean; tier: string }

export function ModelSwitcher({ value, onChange, compact = true }: { value: string; onChange: (id: string) => void; compact?: boolean }) {
  const [options, setOptions] = useState<Option[]>(CATALOG.map((m) => ({ id: m.id, label: m.label, free: m.free, tier: m.tier })));

  useEffect(() => {
    fetch('/api/models').then((r) => (r.ok ? r.json() : null)).then((d) => {
      if (d?.models) setOptions(d.models.map((m: Option) => ({ id: m.id, label: m.label, free: m.free, tier: m.tier })));
    }).catch(() => { /* keep static catalog */ });
  }, []);

  const free = options.filter((o) => o.free);
  const paid = options.filter((o) => !o.free);
  const current = options.find((o) => o.id === value);

  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-muted)' }} title="Modelo de lenguaje">
      <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: current && !current.free ? '#f5b000' : '#22c55e' }} />
      {!compact && <span>Modelo</span>}
      <select
        aria-label="Modelo"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ background: 'var(--color-surface)', color: 'var(--color-text)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '4px 8px', fontSize: 12, maxWidth: 220 }}
      >
        <optgroup label="Gratis (predeterminado)">
          {free.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </optgroup>
        <optgroup label="De pago · se cobra por uso">
          {paid.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </optgroup>
      </select>
    </label>
  );
}
