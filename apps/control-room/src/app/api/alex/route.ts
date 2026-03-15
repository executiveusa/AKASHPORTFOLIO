/**
 * ALEX™ API Route
 * POST /api/alex - Process user messages and execute ALEX™ agent
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAlexAgent, AlexContext } from '@/lib/alex-agent';

export const runtime = 'nodejs';

interface AlexRequest {
  message: string;
  userId: string;
  userName?: string;
  businessName?: string;
  industry?: string;
  language?: 'es' | 'en';
  skillId?: string;
  skillInputs?: Record<string, string>;
}

export async function POST(req: NextRequest) {
  try {
    const body: AlexRequest = await req.json();

    // Validate required fields
    if (!body.message || !body.userId) {
      return NextResponse.json(
        { error: 'Missing required fields: message, userId' },
        { status: 400 }
      );
    }

    // Create ALEX™ context
    const context: AlexContext = {
      userId: body.userId,
      userName: body.userName,
      businessName: body.businessName,
      industry: body.industry,
      language: body.language || 'es',
      timezone: 'America/Mexico_City',
    };

    // Create ALEX™ agent instance
    const alex = createAlexAgent(context);

    let response: string;

    if (body.skillId && body.skillInputs) {
      // Execute specific skill
      const skillResult = await alex.executeSkill(body.skillId, body.skillInputs);
      response = `Skill: ${body.skillId}\n\n${skillResult.output}${skillResult.nextSteps ? `\n\n${skillResult.nextSteps}` : ''}`;
    } else {
      // Regular chat message
      response = await alex.chat(body.message);
    }

    return NextResponse.json({
      success: true,
      response,
      context,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('ALEX™ API Error:', error);

    return NextResponse.json(
      {
        error: 'Error processing ALEX™ request',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for ALEX™ API
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    agent: 'ALEX™',
    message: 'ALEX™ agent is ready to work. Use POST /api/alex to send messages.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
}
