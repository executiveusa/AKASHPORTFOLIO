import { NextResponse } from 'next/server';
import { kupuriGit } from '@/lib/git-manager';
import { requireOperatorOrAdmin, toErrorResponse } from '@/lib/auth/guards';

export async function GET() {
  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

  try { await requireOperatorOrAdmin(); } catch (e) { return toErrorResponse(e); }

    try {
        const metadata = await kupuriGit.fetchAllRepoMetadata();
        return NextResponse.json(metadata);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
