import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// POST: Register for beta
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { platform, identifier } = body;

    if (!platform || !identifier) {
      return NextResponse.json(
        { error: 'platform and identifier required' },
        { status: 400 }
      );
    }

    const user = {
      id: `user-${Date.now()}`,
      platform,
      identifier,
      joinedAt: new Date().toISOString(),
      status: 'active',
      preferences: {
        language: 'es',
        notificationsEnabled: true,
        communityRole: 'observer',
      },
    };

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Beta signup error:', error);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}

// GET: Get beta statistics
export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({
      statistics: {
        totalSignups: 0,
        activeUsers: 0,
        languagePrefs: { en: 0, es: 0 },
        platformDistribution: { whatsapp: 0, tiktok: 0 },
      },
      activeUserCount: 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Beta GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch beta info' }, { status: 500 });
  }
}

// PUT: Redeem invite code
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, email } = body;

    if (!code) {
      return NextResponse.json({ error: 'code required' }, { status: 400 });
    }

    // Hardcoded beta invite codes for MVP
    const VALID_CODES = ['KUPURI2026', 'ALEXBETA', 'CDMX001', 'SYNTHIA2026', 'STAGE8MVP'];

    if (!VALID_CODES.includes(code.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Code is valid - return success
    return NextResponse.json({
      success: true,
      message: 'Beta access granted',
      code,
      accessLevel: 'beta',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    }, { status: 200 });
  } catch (error) {
    console.error('Invite code redemption error:', error);
    return NextResponse.json({ error: 'Failed to redeem code' }, { status: 500 });
  }
}
