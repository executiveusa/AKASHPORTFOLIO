import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

// POST: Track event
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, userId, platform = 'web', data } = body;

    if (!eventType || !platform) {
      return NextResponse.json(
        { error: 'eventType and platform required' },
        { status: 400 }
      );
    }

    const event = {
      id: `event-${Date.now()}`,
      eventType,
      userId,
      platform,
      data: data || {},
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

// GET: Fetch analytics
export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get('type') || 'metrics';

    if (type === 'metrics') {
      return NextResponse.json({
        totalEvents: 0,
        uniqueUsers: 0,
        sentimentAverage: 0,
        topicDistribution: {},
        participationRate: 0,
        decisionConsensus: 0,
      });
    }

    return NextResponse.json({ events: [], count: 0 });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

// DELETE: Prune old events
export async function DELETE(req: NextRequest) {
  try {
    const retentionDays = parseInt(req.nextUrl.searchParams.get('retentionDays') || '30');

    return NextResponse.json({
      success: true,
      prunedEventCount: 0,
      retentionDays,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics DELETE error:', error);
    return NextResponse.json({ error: 'Failed to prune events' }, { status: 500 });
  }
}
