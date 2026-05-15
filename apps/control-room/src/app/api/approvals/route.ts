import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin } from '@/lib/auth/guards';
export async function GET(){await requireOperatorOrAdmin();return NextResponse.json({approvals:[]});}
