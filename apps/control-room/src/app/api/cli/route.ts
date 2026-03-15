/**
 * /api/cli — CLI-Anything API endpoint
 *
 * Gives all Synthia agents access to CLI-Anything tools via HTTP.
 *
 * GET  /api/cli                  → discover installed tools + capabilities
 * GET  /api/cli?tool=gimp        → get capabilities for a specific tool
 * POST /api/cli                  → execute a CLI command
 * POST /api/cli (workflow)       → run a multi-step workflow
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  executeCLI,
  discoverTools,
  runWorkflow,
  exportSocialAsset,
  addCaptionsToVideo,
  generateReport,
  isToolInstalled,
  TOOL_DESCRIPTIONS,
  type CLITool,
  type WorkflowStep,
} from '@/lib/cli-anything';

export const runtime = 'nodejs';

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tool = searchParams.get('tool');

  if (tool) {
    // Specific tool info
    const installed = isToolInstalled(tool);
    const description = TOOL_DESCRIPTIONS[tool] ?? null;
    return NextResponse.json({ tool, installed, description });
  }

  // Discovery: all tools
  const tools = discoverTools();
  const withDescriptions = tools.map(t => ({
    ...t,
    description: TOOL_DESCRIPTIONS[t.tool] ?? null,
  }));

  const installedCount = withDescriptions.filter(t => t.installed).length;

  return NextResponse.json({
    tools: withDescriptions,
    summary: {
      total: withDescriptions.length,
      installed: installedCount,
      missing: withDescriptions.length - installedCount,
    },
    installInstructions: installedCount === 0
      ? 'Run: pip install cli-anything-gimp cli-anything-blender cli-anything-inkscape cli-anything-kdenlive cli-anything-audacity cli-anything-libreoffice'
      : null,
  });
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const mode = (body.mode as string) ?? 'command';

  // ── High-level helpers ──

  if (mode === 'social_asset') {
    // POST { mode: "social_asset", sourcePath, outputPath, platform }
    const { sourcePath, outputPath, platform } = body as {
      sourcePath: string;
      outputPath: string;
      platform: 'tiktok' | 'instagram' | 'linkedin' | 'twitter' | 'youtube_shorts';
    };
    if (!sourcePath || !outputPath || !platform) {
      return NextResponse.json({ error: 'sourcePath, outputPath, platform required' }, { status: 400 });
    }
    const results = await exportSocialAsset({ sourcePath, outputPath, platform });
    return NextResponse.json({ mode, results });
  }

  if (mode === 'captions') {
    // POST { mode: "captions", inputVideo, outputVideo, captions: [{text,startSec,endSec}] }
    const { inputVideo, outputVideo, captions } = body as {
      inputVideo: string;
      outputVideo: string;
      captions: Array<{ text: string; startSec: number; endSec: number }>;
    };
    if (!inputVideo || !outputVideo || !captions) {
      return NextResponse.json({ error: 'inputVideo, outputVideo, captions required' }, { status: 400 });
    }
    const results = await addCaptionsToVideo({ inputVideo, outputVideo, captions });
    return NextResponse.json({ mode, results });
  }

  if (mode === 'report') {
    // POST { mode: "report", title, data: [...], outputDir }
    const { title, data, outputDir } = body as {
      title: string;
      data: Record<string, unknown>[];
      outputDir: string;
    };
    if (!title || !data || !outputDir) {
      return NextResponse.json({ error: 'title, data, outputDir required' }, { status: 400 });
    }
    const results = await generateReport({ title, data, outputDir });
    return NextResponse.json({ mode, results });
  }

  if (mode === 'workflow') {
    // POST { mode: "workflow", steps: [{tool, command, description}], continueOnError? }
    const { steps, continueOnError, projectFile } = body as {
      steps: WorkflowStep[];
      continueOnError?: boolean;
      projectFile?: string;
    };
    if (!steps || !Array.isArray(steps) || steps.length === 0) {
      return NextResponse.json({ error: 'steps array required' }, { status: 400 });
    }
    const results = await runWorkflow(steps, { continueOnError, projectFile });
    const allSuccess = results.every(r => r.success);
    return NextResponse.json({ mode, allSuccess, results });
  }

  // ── Direct command ──
  // POST { tool, command: ["project", "new", "--width", "1080"], projectFile? }
  const { tool, command, projectFile } = body as {
    tool: CLITool | string;
    command: string[];
    projectFile?: string;
  };

  if (!tool || !command || !Array.isArray(command)) {
    return NextResponse.json(
      { error: 'tool and command[] are required. Modes: command | workflow | social_asset | captions | report' },
      { status: 400 }
    );
  }

  const result = await executeCLI(tool, command, { projectFile });
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
