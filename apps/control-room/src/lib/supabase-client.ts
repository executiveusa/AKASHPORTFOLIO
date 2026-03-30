/**
 * Supabase Client - Open Brain Integration
 * Manages agent state, memories, embeddings, and telemetry
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Guard: supabase-js throws on empty key — provide a no-op stub when unconfigured
function safeCreateClient(url: string, key: string) {
    try {
        if (!url || !key) throw new Error('Missing Supabase credentials');
        return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    } catch {
        // Return a stub client that safely no-ops all queries
        return createClient('https://placeholder.supabase.co', 'placeholder-key', {
            auth: { persistSession: false, autoRefreshToken: false },
        });
    }
}

// Client for public queries (anon key)
export const supabaseClient = safeCreateClient(supabaseUrl, supabaseKey);

// Client for privileged operations (service role key)
export const supabaseAdmin = safeCreateClient(supabaseUrl, serviceRoleKey);

/**
 * Agent State Management
 */
export const agentState = {
    async registerAgent(agentId: string, name: string, role: string, metadata: Record<string, any> = {}) {
        return supabaseAdmin
            .from('agent_state')
            .upsert({
                agent_id: agentId,
                name,
                role,
                status: 'idle',
                metadata,
                last_seen: new Date().toISOString(),
                created_at: new Date().toISOString(),
            })
            .select();
    },

    async updateStatus(agentId: string, status: string, currentTask?: string) {
        return supabaseAdmin
            .from('agent_state')
            .update({
                status,
                current_task: currentTask,
                last_seen: new Date().toISOString(),
            })
            .eq('agent_id', agentId);
    },

    async getAgent(agentId: string) {
        return supabaseClient.from('agent_state').select('*').eq('agent_id', agentId).single();
    },

    async listAgents() {
        return supabaseClient.from('agent_state').select('*');
    },
};

/**
 * Memory Management (with vector embeddings)
 */
export const memoryStore = {
    async storeMemory(
        title: string,
        content: string,
        embedding: number[],
        agentId?: string,
        metadata: Record<string, any> = {}
    ) {
        return supabaseAdmin
            .from('memories')
            .insert({
                title,
                summary: content.substring(0, 200),
                content,
                embedding,
                agent_id: agentId,
                type: 'observation',
                status: 'active',
                metadata,
                created_at: new Date().toISOString(),
            })
            .select();
    },

    async searchMemoriesByVector(embedding: number[], limit = 10, minSimilarity = 0.7) {
        // Note: Direct vector search via RPC function
        return supabaseAdmin.rpc('search_memories_by_vector', {
            embedding,
            count: limit,
            min_similarity: minSimilarity,
        });
    },

    async searchMemoriesFulltext(query: string, limit = 10) {
        return supabaseAdmin.rpc('search_memories_fulltext', {
            query,
            count: limit,
        });
    },

    async getMemory(memoryId: string) {
        return supabaseClient.from('memories').select('*').eq('id', memoryId).single();
    },

    async linkMemories(sourceId: string, targetId: string, relationshipType = 'related') {
        return supabaseAdmin
            .from('memory_links')
            .insert({
                source_id: sourceId,
                target_id: targetId,
                type: relationshipType,
            })
            .select();
    },
};

/**
 * Observation & Telemetry
 */
export const telemetry = {
    async logEvent(
        sessionId: string,
        eventType: string,
        summary: string,
        data: Record<string, any> = {}
    ) {
        return supabaseAdmin
            .from('observations')
            .insert({
                session_id: sessionId,
                event_type: eventType,
                summary,
                data,
                created_at: new Date().toISOString(),
            })
            .select();
    },

    async getSessionEvents(sessionId: string, limit = 100) {
        return supabaseClient
            .from('observations')
            .select('*')
            .eq('session_id', sessionId)
            .order('created_at', { ascending: false })
            .limit(limit);
    },
};

/**
 * Conversation Store (with embeddings)
 */
export const conversations = {
    async startConversation(sessionId: string, participants: string[], metadata: Record<string, any> = {}) {
        return supabaseAdmin
            .from('conversations')
            .insert({
                session_id: sessionId,
                participants,
                status: 'active',
                metadata,
                created_at: new Date().toISOString(),
            })
            .select();
    },

    async addMessage(
        conversationId: string,
        role: string,
        content: string,
        embedding: number[],
        agentId?: string
    ) {
        return supabaseAdmin
            .from('conversation_messages')
            .insert({
                conversation_id: conversationId,
                role,
                content,
                embedding,
                agent_id: agentId,
                created_at: new Date().toISOString(),
            })
            .select();
    },

    async getConversation(conversationId: string) {
        const { data: conv } = await supabaseClient
            .from('conversations')
            .select('*')
            .eq('id', conversationId)
            .single();

        const { data: messages } = await supabaseClient
            .from('conversation_messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at');

        return { conversation: conv, messages };
    },
};

/**
 * Health Check
 */
export async function testSupabaseConnection() {
    try {
        const { data, error } = await supabaseClient.from('agent_state').select('count').limit(1);
        if (error) throw error;
        return { connected: true, timestamp: new Date().toISOString() };
    } catch (err: any) {
        console.error('Supabase connection failed:', err.message);
        return { connected: false, error: err.message };
    }
}
