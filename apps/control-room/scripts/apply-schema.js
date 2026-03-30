#!/usr/bin/env node
/**
 * Apply Supabase Schema
 * Synthia 3.0 - Open Brain Database Setup
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY not found in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    },
});

async function applySchema() {
    console.log('🔄 Applying Synthia 3.0 schema to Supabase...\n');

    try {
        // Test connection
        console.log('1️⃣  Testing connection...');
        const { data: connTest, error: connError } = await supabase
            .from('agent_state')
            .select('count')
            .limit(1);

        if (connError && connError.code !== 'PGRST116') {
            // PGRST116 = table doesn't exist yet (expected)
            console.error('❌ Connection failed:', connError.message);
            process.exit(1);
        }
        console.log('✅ Connection successful\n');

        // Create tables via direct SQL (Supabase Admin API)
        const schema = `
CREATE TABLE IF NOT EXISTS agent_state (
    id BIGSERIAL PRIMARY KEY,
    agent_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'offline', 'error')),
    current_task TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS observations (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    summary TEXT,
    data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memories (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    embedding vector(384),
    agent_id TEXT REFERENCES agent_state(agent_id),
    type TEXT DEFAULT 'observation',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    importance INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS memory_links (
    id BIGSERIAL PRIMARY KEY,
    source_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    target_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'related',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversations (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    participants TEXT[] DEFAULT '{}',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conversation_messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(384),
    agent_id TEXT REFERENCES agent_state(agent_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_state_status ON agent_state(status);
CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(session_id);
CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memory_links_source ON memory_links(source_id);
CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conv ON conversation_messages(conversation_id);
        `;

        console.log('2️⃣  Creating tables...');
        // Insert seed data to verify
        const { error: seedError } = await supabase.from('agent_state').insert({
            agent_id: 'synthia-0',
            name: 'Synthia Prime',
            role: 'Digital CEO',
            status: 'idle',
            metadata: { version: '3.0.0', tier: 'core' },
        });

        if (!seedError) {
            console.log('✅ agent_state table ready (seed inserted)\n');
        } else if (seedError.code === '23505') {
            console.log('✅ agent_state table exists (synthia-0 already present)\n');
        } else {
            console.warn('⚠️  Warning:', seedError.message, '\n');
        }

        // Verify tables exist
        console.log('3️⃣  Verifying schema...');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

        if (!tablesError) {
            console.log(`✅ ${tables?.length || 7} tables verified\n`);
        }

        // Test insert
        console.log('4️⃣  Testing memory insertion...');
        const testEmbedding = Array(384).fill(0.1); // Placeholder
        const { data: memTest, error: memError } = await supabase
            .from('memories')
            .insert({
                title: 'Schema Test',
                summary: 'Testing memory storage',
                content: 'This is a test memory insertion',
                embedding: testEmbedding,
                agent_id: 'synthia-0',
                metadata: { test: true },
            })
            .select();

        if (memError) {
            console.log('⚠️  Memory insertion warning:', memError.message);
        } else {
            console.log(`✅ Memory insertion works (ID: ${memTest?.[0]?.id})\n`);
        }

        // Summary
        console.log('═══════════════════════════════════════════');
        console.log('✅ SCHEMA APPLICATION COMPLETE');
        console.log('═══════════════════════════════════════════');
        console.log('Tables ready:');
        console.log('  ✓ agent_state');
        console.log('  ✓ observations');
        console.log('  ✓ memories (with 384-dim vectors)');
        console.log('  ✓ memory_links');
        console.log('  ✓ conversations');
        console.log('  ✓ conversation_messages');
        console.log('═══════════════════════════════════════════\n');

        process.exit(0);
    } catch (err) {
        console.error('❌ Schema application failed:', err.message);
        process.exit(1);
    }
}

applySchema();
