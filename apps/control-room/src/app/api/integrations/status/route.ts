import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin } from '@/lib/auth/guards';
import { getIntegrationStatus } from '@/lib/integrations/status';
export async function GET(){await requireOperatorOrAdmin(); return NextResponse.json({ integrations: getIntegrationStatus() });}
