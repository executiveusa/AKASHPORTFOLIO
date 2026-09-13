/**
 * council-voice.ts — per-turn voice synthesis for the SYNTHIA™ council.
 *
 * speakTurn:
 *   Wraps rimeStreamTurn (Rime WS /ws3 with REST + estimated-timing fallback),
 *   annotates each VoiceEvent with {t, meetingId} to match the
 *   council-events VoiceEvent union, and enforces per-meeting / daily
 *   character-spend caps.
 *
 * Budget env vars (server-side only):
 *   VOICE_MEETING_CHAR_CAP  (default 6000  chars ≈ $0.50 per meeting)
 *   VOICE_DAILY_CHAR_CAP    (default 60000 chars ≈ $5.00 per day)
 *   VOICE_PROVIDER=off      → immediate text-only fallback for every call
 *
 * Never import this module in client code — it reads server env vars and
 * depends on server-only rime-voice.ts (WebSocket + Node fetch).
 */

import { rimeStreamTurn } from '@/lib/voice/rime-voice';
import type { VoiceEvent as RimeVoiceEvent } from '@/lib/voice/rime-voice';
import type { VoiceEvent, SphereAgentId, VoiceLang } from '@/shared/council-events';

// ── Budget counters (module-level, reset on cold start) ────────────────────

/** Characters synthesized per meeting. Cleared by releaseMeetingVoiceBudget. */
const meetingCharMap = new Map<string, number>();

/** Characters synthesized today; resets automatically at UTC midnight. */
let dailyCharCount = 0;
let dailyResetDate = _todayUtc();

function _todayUtc(): string {
  return new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

function _checkAndResetDaily(): void {
  const today = _todayUtc();
  if (today !== dailyResetDate) {
    dailyCharCount = 0;
    dailyResetDate = today;
  }
}

function _getMeetingCap(): number {
  const raw = parseInt(process.env.VOICE_MEETING_CHAR_CAP ?? '', 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 6000;
}

function _getDailyCap(): number {
  const raw = parseInt(process.env.VOICE_DAILY_CHAR_CAP ?? '', 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 60000;
}

// ── Public exports ─────────────────────────────────────────────────────────

/**
 * Rough cost estimate for Rime mistv3.
 * Rime pricing (2026-09): ~$0.000083 per character for mistv3.
 * Use as a conservative upper bound; actual cost varies by speaker model.
 */
export function estimateVoiceCostUsd(chars: number): number {
  return chars * 0.000083;
}

/**
 * Release a meeting's per-meeting character budget entry.
 * Call from the orchestrator when a meeting ends to keep the map from growing.
 */
export function releaseMeetingVoiceBudget(meetingId: string): void {
  meetingCharMap.delete(meetingId);
}

/**
 * Synthesize one council agent turn and re-emit voice.* events annotated
 * with {t, meetingId} so they match the council-events VoiceEvent union.
 *
 * The caller (orchestrator) is responsible for ensuring calls are
 * sequential per meeting so speakers do not overlap.
 *
 * Budget enforcement order (checked before opening the Rime stream):
 *   1. VOICE_PROVIDER=off                          → voice.fallback immediately
 *   2. meetingCharCount >= VOICE_MEETING_CHAR_CAP  → voice.fallback (reason: 'voice_budget')
 *   3. dailyCharCount   >= VOICE_DAILY_CHAR_CAP    → voice.fallback (reason: 'voice_budget')
 *
 * Characters are debited optimistically before the stream opens.
 * Concurrent calls to speakTurn for the same meeting may slightly over-run
 * the cap; the orchestrator's sequential queue prevents this in practice.
 */
export async function speakTurn(
  meetingId: string,
  agentId: SphereAgentId,
  transcript: string,
  lang: VoiceLang,
  emit: (ev: VoiceEvent) => void,
): Promise<void> {
  const t = Date.now();

  // 1. Provider disabled globally
  if (process.env.VOICE_PROVIDER === 'off') {
    emit({ t, type: 'voice.fallback', meetingId, agentId, text: transcript } as VoiceEvent);
    return;
  }

  // 2 & 3. Per-meeting and daily caps
  _checkAndResetDaily();
  const chars = transcript.length;
  const meetingChars = meetingCharMap.get(meetingId) ?? 0;

  if (meetingChars >= _getMeetingCap() || dailyCharCount >= _getDailyCap()) {
    // 'reason' is additive — not declared in the VoiceEvent type but preserved
    // in JSON.stringify, visible in the SSE stream for client-side diagnostics.
    const fallback = {
      t,
      type: 'voice.fallback' as const,
      meetingId,
      agentId,
      text: transcript,
      reason: 'voice_budget',
    };
    emit(fallback as unknown as VoiceEvent);
    return;
  }

  // Debit budget optimistically before streaming
  meetingCharMap.set(meetingId, meetingChars + chars);
  dailyCharCount += chars;

  // Stable contextId groups all chunks/words/done for this utterance
  const contextId = `${meetingId}:${agentId}:${t}`;

  // rimeStreamTurn emits rime-voice VoiceEvents (no t / meetingId fields).
  // Lift each to the council-events VoiceEvent shape below.
  await rimeStreamTurn(agentId, transcript, lang, (raw: RimeVoiceEvent) => {
    const now = Date.now();
    switch (raw.type) {
      case 'voice.chunk':
        emit({
          t: now,
          type: 'voice.chunk',
          meetingId,
          agentId: raw.agentId,
          contextId: raw.contextId,
          data: raw.data,
        } as VoiceEvent);
        break;
      case 'voice.words':
        emit({
          t: now,
          type: 'voice.words',
          meetingId,
          agentId: raw.agentId,
          contextId: raw.contextId,
          words: raw.words,
          start: raw.start,
          end: raw.end,
        } as VoiceEvent);
        break;
      case 'voice.done':
        emit({
          t: now,
          type: 'voice.done',
          meetingId,
          agentId: raw.agentId,
          contextId: raw.contextId,
        } as VoiceEvent);
        break;
      case 'voice.fallback':
        // Preserve reason from Rime as an additive field
        emit({
          t: now,
          type: 'voice.fallback',
          meetingId,
          agentId: raw.agentId,
          text: raw.text,
          reason: raw.reason,
        } as unknown as VoiceEvent);
        break;
    }
  }, contextId);
}
