import { NextResponse } from 'next/server';
import { kupuriGit } from '@/lib/git-manager';

export async function GET() {
    try {
        const metadata = await kupuriGit.fetchAllRepoMetadata();
        return NextResponse.json(metadata);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
