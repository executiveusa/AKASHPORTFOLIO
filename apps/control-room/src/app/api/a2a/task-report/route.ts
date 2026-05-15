import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth/guards';
export async function POST(req:Request){await requireUser();return NextResponse.json(await req.json());}
