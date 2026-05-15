import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
export async function GET(){await requireUser();return NextResponse.json({agents:[]});}
