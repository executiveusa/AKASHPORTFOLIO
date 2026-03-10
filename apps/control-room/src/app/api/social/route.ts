/**
 * Social Media Automation API — KUPURI MEDIA™
 * GET  /api/social           → List campaigns
 * GET  /api/social?id=X      → Get specific campaign
 * POST /api/social           → Create new A/B test campaign
 * POST /api/social/demo      → Create viral demo campaign instantly
 * PUT  /api/social           → Record metrics for a variant
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCampaigns, getCampaign, createCampaign, createViralDemo, recordMetrics, getActiveCampaigns, Platform } from '../../../lib/social-media';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const active = searchParams.get('active') === 'true';

  if (id) {
    const campaign = getCampaign(id);
    if (!campaign) return NextResponse.json({ error: 'Campaña no encontrada' }, { status: 404 });
    return NextResponse.json(campaign);
  }

  if (active) {
    return NextResponse.json(getActiveCampaigns());
  }

  return NextResponse.json(getCampaigns());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode } = body;

    if (mode === 'viral_demo') {
      const { serviceName, keyBenefit, evidence } = body;
      if (!serviceName || !keyBenefit) {
        return NextResponse.json({ error: 'Se requiere serviceName y keyBenefit' }, { status: 400 });
      }
      const campaign = await createViralDemo(serviceName, keyBenefit, evidence || '');
      return NextResponse.json(campaign, { status: 201 });
    }

    const { name, objective, keyMessage, targetAudience, platforms } = body;
    if (!name || !objective || !keyMessage || !targetAudience || !platforms?.length) {
      return NextResponse.json({ error: 'Se requieren: name, objective, keyMessage, targetAudience, platforms' }, { status: 400 });
    }

    const campaign = await createCampaign(name, objective, keyMessage, targetAudience, platforms as Platform[]);
    return NextResponse.json(campaign, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { campaignId, variantId, metrics } = await req.json();
    if (!campaignId || !variantId || !metrics) {
      return NextResponse.json({ error: 'Se requieren: campaignId, variantId, metrics' }, { status: 400 });
    }
    recordMetrics(campaignId, variantId, metrics);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
