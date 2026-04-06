import { NextRequest, NextResponse } from 'next/server';

interface SubscribeRequest {
  email: string;
}

// In-memory subscriber list (in production, use a database)
const subscribers = new Set<string>();

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    if (subscribers.has(email.toLowerCase())) {
      return NextResponse.json(
        { message: 'Already subscribed', email },
        { status: 200 }
      );
    }

    // Add to subscribers
    subscribers.add(email.toLowerCase());

    // TODO: In production, integrate with:
    // - Supabase: save to newsletter_subscribers table
    // - SendGrid / Mailchimp: add to mailing list
    // - Trigger welcome email

    return NextResponse.json(
      { 
        message: 'Successfully subscribed to El Panorama',
        email,
        subscriberCount: subscribers.size 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Newsletter API',
      subscribers: subscribers.size,
      endpoint: 'POST /api/newsletter/subscribe'
    },
    { status: 200 }
  );
}
