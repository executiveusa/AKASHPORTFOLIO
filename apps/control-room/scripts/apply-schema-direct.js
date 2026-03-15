#!/usr/bin/env node
/**
 * Apply Supabase Schema - Direct PostgreSQL Connection
 * Uses node-postgres (pg) if available, otherwise Node postgres
 */

async function applySchema() {
    console.log('🔄 Applying Synthia 3.0 schema...\n');

    const connectionString =
        process.env.DATABASE_URL ||
        'postgresql://postgres:072090156d28a9df6502d94083e47990@31.220.58.212:5434/second_brain';

    try {
        // Try using postgres client
        let sql;
        try {
            sql = (await import('postgres')).default;
        } catch (e) {
            console.log('⚠️  postgres module not available, trying node-pg...\n');
            const pg = require('pg');
            const client = new pg.Client({ connectionString });

            await client.connect();
            console.log('✅ Connected to PostgreSQL\n');

            const schemas = [
                `CREATE TABLE IF NOT EXISTS agent_state (
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
                );`,

                `CREATE TABLE IF NOT EXISTS observations (
                    id BIGSERIAL PRIMARY KEY,
                    session_id TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    summary TEXT,
                    data JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );`,

                `CREATE TABLE IF NOT EXISTS memories (
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
                );`,

                `CREATE TABLE IF NOT EXISTS memory_links (
                    id BIGSERIAL PRIMARY KEY,
                    source_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
                    target_id BIGINT NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
                    type TEXT DEFAULT 'related',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );`,

                `CREATE TABLE IF NOT EXISTS conversations (
                    id BIGSERIAL PRIMARY KEY,
                    session_id TEXT UNIQUE NOT NULL,
                    participants TEXT[] DEFAULT '{}',
                    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
                    metadata JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );`,

                `CREATE TABLE IF NOT EXISTS conversation_messages (
                    id BIGSERIAL PRIMARY KEY,
                    conversation_id BIGINT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
                    role TEXT NOT NULL,
                    content TEXT NOT NULL,
                    embedding vector(384),
                    agent_id TEXT REFERENCES agent_state(agent_id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );`,

                `CREATE INDEX IF NOT EXISTS idx_agent_state_status ON agent_state(status);`,
                `CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(session_id);`,
                `CREATE INDEX IF NOT EXISTS idx_memories_agent ON memories(agent_id);`,
                `CREATE INDEX IF NOT EXISTS idx_memory_links_source ON memory_links(source_id);`,
                `CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);`,
                `CREATE INDEX IF NOT EXISTS idx_conversation_messages_conv ON conversation_messages(conversation_id);`,
            ];

            console.log('📝 Creating tables and indexes...');
            for (const schema of schemas) {
                try {
                    await client.query(schema);
                } catch (err) {
                    if (err.message.includes('already exists')) {
                        // Expected for subsequent runs
                    } else {
                        console.warn('⚠️  ', err.message);
                    }
                }
            }
            console.log('✅ All tables created\n');

            // Seed Synthia agent
            console.log('🌱 Seeding Synthia agent...');
            try {
                await client.query(
                    `INSERT INTO agent_state (agent_id, name, role, status, metadata)
                     VALUES ($1, $2, $3, $4, $5)
                     ON CONFLICT (agent_id) DO NOTHING`,
                    [
                        'synthia-0',
                        'Synthia Prime',
                        'Digital CEO',
                        'idle',
                        JSON.stringify({ version: '3.0.0', tier: 'core' }),
                    ]
                );
                console.log('✅ Synthia agent seeded\n');
            } catch (err) {
                console.warn('⚠️  Seed warning:', err.message, '\n');
            }

            // Verify
            console.log('✅ Verifying schema...');
            const result = await client.query(
                `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
            );
            console.log(`Found ${result.rows.length} tables:`);
            result.rows.forEach((row) => {
                console.log(`  ✓ ${row.table_name}`);
            });

            await client.end();
            console.log('\n═══════════════════════════════════════════');
            console.log('✅ SCHEMA APPLICATION COMPLETE');
            console.log('═══════════════════════════════════════════\n');
            process.exit(0);
        }
    } catch (err) {
        console.error('❌ Schema application failed:', err.message);
        process.exit(1);
    }
}

applySchema();
