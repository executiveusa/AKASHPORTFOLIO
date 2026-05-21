/**
 * Hermes Memory Adapter
 * Wraps memory read/write with graceful degradation when Hermes is offline.
 */

import { queryMemory, writeMemory } from './hermes-client';
import type { HermesMemory } from './hermes-types';

export async function rememberFact(
  content: string,
  agentId?: string,
  threadId?: string,
): Promise<HermesMemory | null> {
  try {
    return await writeMemory({
      memory_type: 'fact',
      content,
      source: 'user',
      agent_id: agentId,
      thread_id: threadId,
      accepted: true,
    });
  } catch {
    return null;
  }
}

export async function recallMemory(
  query: string,
  agentId?: string,
): Promise<HermesMemory[]> {
  try {
    return await queryMemory(query, agentId ? { agent_id: agentId } : undefined);
  } catch {
    return [];
  }
}

export async function saveSuggestion(
  content: string,
  threadId: string,
  source = 'synthia',
): Promise<HermesMemory | null> {
  try {
    return await writeMemory({
      memory_type: 'suggestion',
      content,
      source,
      thread_id: threadId,
      accepted: undefined,
    });
  } catch {
    return null;
  }
}

export async function acceptSuggestion(suggestionId: string): Promise<void> {
  try {
    await writeMemory({
      id: suggestionId,
      memory_type: 'suggestion',
      content: '',
      source: 'user',
      accepted: true,
    });
  } catch {
    // Degrade silently — memory is non-critical path
  }
}
