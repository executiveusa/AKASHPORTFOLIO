import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin } from '@/lib/auth/guards';
export async function POST(req:Request,{params}:{params:{id:string}}){await requireOperatorOrAdmin();const body=await req.json();return NextResponse.json({id:params.id,decision:body.decision});}
