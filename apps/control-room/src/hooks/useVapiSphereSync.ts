'use client';

/**
 * useVapiSphereSync.ts — Bead B3
 * Subscribes to VAPI call events and pulses the sphere physics field in sync.
 * When ALEX™ tools fire (council meeting, sphere status, etc.), the corresponding
 * sphere gets an energy boost and coherence pulse.
 *
 * Usage:
 *   const { field, isActive } = useVapiSphereSync(vapiClientRef);
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CouncilField } from '@/lib/sphere-physics';
import type { SphereAgentId } from '@/shared/council-events';

// Tool → sphere mapping: which tool call activates which sphere
const TOOL_SPHERE_MAP: Record<string, SphereAgentId[]> = {
  get_sphere_status:   ['synthia'],
  run_council_meeting: ['synthia', 'alex', 'cazadora', 'forjadora'],
  search_knowledge:    ['ing-teknos', 'dra-cultura'],
  create_task:         ['forjadora', 'alex'],
  get_analytics:       ['dr-economia', 'synthia'],
};

// Dynamic import to avoid SSR issues
async function loadPhysics() {
  const { createCouncilField, applyEventToField, tickCouncilField } = await import('@/lib/sphere-physics');
  return { createCouncilField, applyEventToField, tickCouncilField };
}

export interface VapiSphereState {
  field: CouncilField | null;
  isActive: boolean;
  activeSpheres: SphereAgentId[];
  coherence: number;           // [0..1]
  lastToolCall: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useVapiSphereSync(vapiClientRef: React.MutableRefObject<any>) {
  const [state, setState] = useState<VapiSphereState>({
    field: null,
    isActive: false,
    activeSpheres: [],
    coherence: 0,
    lastToolCall: null,
  });

  const fieldRef = useRef<CouncilField | null>(null);
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const startField = useCallback(async () => {
    const { createCouncilField } = await loadPhysics();
    const field = createCouncilField(`vapi-${Date.now()}`);
    fieldRef.current = field;
    setState(s => ({ ...s, field, isActive: true, coherence: field.groupCoherence }));

    // Tick at 10fps while active
    tickInterval.current = setInterval(async () => {
      if (!fieldRef.current) return;
      const { tickCouncilField } = await loadPhysics();
      const next = tickCouncilField(fieldRef.current, 0.1);
      fieldRef.current = next;
      setState(s => ({ ...s, field: next, coherence: next.groupCoherence }));
    }, 100);
  }, []);

  const stopField = useCallback(() => {
    if (tickInterval.current) {
      clearInterval(tickInterval.current);
      tickInterval.current = null;
    }
    fieldRef.current = null;
    setState(s => ({ ...s, isActive: false, activeSpheres: [], lastToolCall: null }));
  }, []);

  const pulseSpheresForTool = useCallback(async (toolName: string) => {
    if (!fieldRef.current) return;
    const { applyEventToField } = await loadPhysics();
    const spheres = TOOL_SPHERE_MAP[toolName] ?? ['alex'];
    let field = fieldRef.current;
    for (const sphereId of spheres) {
      field = applyEventToField(field, {
        t: Date.now(),
        type: 'agent_contribute',
        agentId: sphereId,
        timestamp: Date.now(),
        data: { contribution: 0.3, source: `vapi:${toolName}` },
      });
    }
    fieldRef.current = field;
    setState(s => ({ ...s, field, activeSpheres: spheres, lastToolCall: toolName }));

    // Clear active highlight after 2s
    setTimeout(() => {
      setState(s => ({ ...s, activeSpheres: [] }));
    }, 2000);
  }, []);

  useEffect(() => {
    const client = vapiClientRef.current;
    if (!client) return;

    const onCallStart = () => { startField(); };
    const onCallEnd = () => { stopField(); };
    const onMessage = (msg: { type: string; toolCallList?: Array<{ name: string }> }) => {
      if (msg.type === 'tool-calls' && msg.toolCallList?.length) {
        msg.toolCallList.forEach(tc => pulseSpheresForTool(tc.name));
      }
      // Also pulse alex sphere on any assistant transcript
      if (msg.type === 'transcript' && (msg as { role?: string }).role === 'assistant') {
        pulseSpheresForTool('get_analytics'); // lightweight pulse on alex
      }
    };

    client.on('call-start', onCallStart);
    client.on('call-end', onCallEnd);
    client.on('message', onMessage);

    return () => {
      client.off?.('call-start', onCallStart);
      client.off?.('call-end', onCallEnd);
      client.off?.('message', onMessage);
      stopField();
    };
  }, [vapiClientRef, startField, stopField, pulseSpheresForTool]);

  return state;
}
