/**
 * Video Watch API — SYNTHIA™ Sphere OS
 * POST /api/video/watch
 *
 * Enables any sphere agent to analyze YouTube (and any yt-dlp-supported) video.
 * Based on the claude-video skill by @bradautomates (MIT License).
 *
 * Required env vars:
 *   GROQ_API_KEY   — Groq Whisper (preferred, cheaper)
 *   OPENAI_API_KEY — OpenAI Whisper (fallback)
 *
 * System dependencies (must be on server PATH):
 *   yt-dlp, ffmpeg, ffprobe, python3
 *
 * On Vercel: proxies to NEXT_PUBLIC_SYNTHIA_BACKEND_URL (Hostinger VPS).
 */

import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, rm, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

export const runtime = 'nodejs';
export const maxDuration = 120;

const execAsync = promisify(exec);

interface VideoWatchRequest {
  url: string;
  question?: string;
  startTime?: string;
  endTime?: string;
  maxFrames?: number;
  resolution?: number;
  noWhisper?: boolean;
  sphereId?: string;
}

async function checkDependencies(): Promise<{ available: boolean; missing: string[] }> {
  const missing: string[] = [];
  for (const cmd of ['yt-dlp', 'ffmpeg', 'ffprobe', 'python3']) {
    try {
      await execAsync(`which ${cmd}`);
    } catch {
      missing.push(cmd);
    }
  }
  return { available: missing.length === 0, missing };
}

async function getWatchScriptPath(): Promise<string> {
  const projectSkillsPath = path.join(process.cwd(), 'src/lib/skills/claude-video/scripts/watch.py');
  const fallbackPath = path.join(os.homedir(), '.claude/skills/watch/scripts/watch.py');

  if (existsSync(projectSkillsPath)) return projectSkillsPath;
  if (existsSync(fallbackPath)) return fallbackPath;

  throw new Error(
    'claude-video skill not installed. Run: git clone https://github.com/bradautomates/claude-video.git src/lib/skills/claude-video'
  );
}

async function runWatchScript(
  scriptPath: string,
  url: string,
  options: {
    startTime?: string;
    endTime?: string;
    maxFrames?: number;
    resolution?: number;
    noWhisper?: boolean;
    outDir: string;
  }
): Promise<{ framePaths: string[]; transcript: string; workDir: string }> {
  const args = [`"${url}"`];

  if (options.startTime) args.push(`--start "${options.startTime}"`);
  if (options.endTime) args.push(`--end "${options.endTime}"`);
  if (options.maxFrames) args.push(`--max-frames ${options.maxFrames}`);
  if (options.resolution) args.push(`--resolution ${options.resolution}`);
  if (options.noWhisper) args.push('--no-whisper');
  args.push(`--out-dir "${options.outDir}"`);

  const env = {
    ...process.env,
    GROQ_API_KEY: process.env.GROQ_API_KEY || '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  };

  const cmd = `python3 "${scriptPath}" ${args.join(' ')}`;

  try {
    const { stdout, stderr } = await execAsync(cmd, {
      env,
      timeout: 90000,
      maxBuffer: 10 * 1024 * 1024,
    });

    if (stderr && !stderr.includes('WARNING')) {
      console.warn('[video/watch] script stderr:', stderr.slice(0, 500));
    }

    const lines = stdout.split('\n').filter(Boolean);
    const framePaths: string[] = [];
    let transcript = '';
    let inTranscript = false;

    for (const line of lines) {
      if (line.startsWith('TRANSCRIPT:')) { inTranscript = true; continue; }
      if (line.startsWith('WORKDIR:')) { continue; }
      if (inTranscript) {
        transcript += line + '\n';
      } else if (line.endsWith('.jpg') || line.endsWith('.jpeg')) {
        framePaths.push(line.trim());
      }
    }

    return { framePaths, transcript: transcript.trim(), workDir: options.outDir };
  } catch (error: unknown) {
    const execError = error as { code?: number; stderr?: string; message?: string };
    throw new Error(`watch.py failed (exit ${execError?.code}): ${execError?.stderr || execError?.message}`);
  }
}

async function frameToBase64(framePath: string): Promise<string | null> {
  try {
    const data = await readFile(framePath);
    return data.toString('base64');
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body: VideoWatchRequest = await req.json();
    const {
      url,
      question,
      startTime: start,
      endTime: end,
      maxFrames = 80,
      resolution = 512,
      noWhisper = false,
      sphereId = 'synthia',
    } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing required field: url' }, { status: 400 });
    }

    const { available, missing } = await checkDependencies();
    if (!available) {
      return NextResponse.json(
        {
          error: 'Missing server dependencies',
          missing,
          setup: 'Requires yt-dlp, ffmpeg, and python3 on the server.',
          note: 'On Vercel, set NEXT_PUBLIC_SYNTHIA_BACKEND_URL to your VPS.',
        },
        { status: 503 }
      );
    }

    let scriptPath: string;
    try {
      scriptPath = await getWatchScriptPath();
    } catch (err: unknown) {
      return NextResponse.json(
        {
          error: 'claude-video skill not installed',
          install: 'git clone https://github.com/bradautomates/claude-video.git src/lib/skills/claude-video',
          details: (err as Error).message,
        },
        { status: 503 }
      );
    }

    const outDir = path.join(os.tmpdir(), `synthia-video-${Date.now()}`);
    await mkdir(outDir, { recursive: true });

    try {
      const { framePaths, transcript } = await runWatchScript(scriptPath, url, {
        startTime: start,
        endTime: end,
        maxFrames,
        resolution,
        noWhisper,
        outDir,
      });

      const FRAME_CAP = Math.min(framePaths.length, 20);
      const frameData = await Promise.all(
        framePaths.slice(0, FRAME_CAP).map(async (fp) => ({
          path: fp,
          timestamp: path.basename(fp, '.jpg').replace('frame_', '').replace('_', ':'),
          data: await frameToBase64(fp),
        }))
      );

      return NextResponse.json({
        success: true,
        url,
        question: question || null,
        sphereId,
        stats: {
          totalFrames: framePaths.length,
          framesInResponse: FRAME_CAP,
          hasTranscript: transcript.length > 0,
          processingMs: Date.now() - startTime,
        },
        frames: frameData.filter((f) => f.data !== null),
        transcript: transcript || null,
        workDir: outDir,
        note: framePaths.length > FRAME_CAP
          ? `${framePaths.length - FRAME_CAP} additional frames available in workDir`
          : null,
      });
    } finally {
      setTimeout(async () => {
        try { await rm(outDir, { recursive: true, force: true }); } catch {}
      }, 5 * 60 * 1000);
    }
  } catch (error) {
    console.error('[video/watch] Error:', error);
    return NextResponse.json(
      {
        error: 'Video processing failed',
        details: error instanceof Error ? error.message : String(error),
        processingMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  const { available, missing } = await checkDependencies();

  let skillInstalled = false;
  try { await getWatchScriptPath(); skillInstalled = true; } catch {}

  return NextResponse.json({
    service: 'video-watch',
    available: available && skillInstalled,
    dependencies: {
      binaries: available ? 'ok' : `missing: ${missing.join(', ')}`,
      skill: skillInstalled ? 'ok' : 'not installed — run: git clone https://github.com/bradautomates/claude-video.git src/lib/skills/claude-video',
    },
    whisper: {
      groq: !!process.env.GROQ_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
    },
    note: 'Requires Node.js runtime. Returns 503 on Vercel — set NEXT_PUBLIC_SYNTHIA_BACKEND_URL to VPS.',
  });
}
