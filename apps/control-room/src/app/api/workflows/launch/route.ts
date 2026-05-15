import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin } from '@/lib/auth/guards';
import { difyAvailable } from '@/lib/workflows/dify';
import { emitEvent } from '@/lib/observability/events';
export async function POST(req:Request){const s=await requireOperatorOrAdmin();const body=await req.json();if(!difyAvailable()) return NextResponse.json({ok:false,reason:'DIFY_UNAVAILABLE'},{status:503});return NextResponse.json({ok:true,run:{workflowId:body.workflowId,requestedBy:s.user.email},event:emitEvent('workflow_launched',body)});}
