/**
 * Health Check Endpoint
 */

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { testSupabaseConnection } from '@/lib/supabase-client';
import { synthiaSwarm } from '@/lib/swarm';

export async function GET() {
    try {
        const supabaseHealth = await testSupabaseConnection();
        const agents = await synthiaSwarm.listAllAgents();

        return NextResponse.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            components: {
                supabase: supabaseHealth,
                agents: {
                    total: agents.length,
                    active: agents.filter((a) => a.status === 'working').length,
                    idle: agents.filter((a) => a.status === 'idle').length,
                },
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'unhealthy',
                error: error.message,
            },
            { status: 503 }
        );
    }
}
