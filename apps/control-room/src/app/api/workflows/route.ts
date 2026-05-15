import { NextResponse } from 'next/server';
import { requireOperatorOrAdmin } from '@/lib/auth/guards';
import { difyAvailable, localWorkflows } from '@/lib/workflows/dify';
export async function GET(){await requireOperatorOrAdmin();return NextResponse.json({available:difyAvailable(),workflows:localWorkflows});}
