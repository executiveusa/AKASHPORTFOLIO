/**
 * CLI-Anything Integration — KUPURI MEDIA™ / Synthia 3.0
 *
 * Wraps HKUDS/CLI-Anything to give all Synthia agents direct control over
 * professional creative software: GIMP, Blender, Inkscape, Kdenlive,
 * Audacity, LibreOffice, OBS Studio, Draw.io, and any custom CLI.
 *
 * How it works:
 *   1. CLI tools are installed via `pip install cli-anything-<tool>`
 *   2. Each tool exposes a `cli-anything-<tool> --json <command> [args]` interface
 *   3. This wrapper calls them as child processes and parses JSON output
 *   4. Agents call `executeCLI()` or the high-level helpers below
 *
 * https://github.com/HKUDS/CLI-Anything
 */

import { execFile, execFileSync } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { synthiaObservability } from './observability';

const execFileAsync = promisify(execFile);

// ─── Types ────────────────────────────────────────────────────────────────────

export type CLITool =
  | 'gimp'
  | 'blender'
  | 'audacity'
  | 'inkscape'
  | 'kdenlive'
  | 'shotcut'
  | 'libreoffice'
  | 'obs-studio'
  | 'drawio'
  | 'anygen';

export interface CLIResult {
  success: boolean;
  data?: unknown;
  error?: string;
  raw?: string;
  tool: CLITool | string;
  command: string[];
  durationMs: number;
}

export interface ToolCapability {
  tool: string;
  installed: boolean;
  version?: string;
  commands?: string[];
}

export interface WorkflowStep {
  tool: CLITool | string;
  command: string[];
  description?: string;
}

// ─── Tool descriptions for agent context ─────────────────────────────────────

export const TOOL_DESCRIPTIONS: Record<string, {
  purpose: string;
  agents: string[];
  useCases: string[];
}> = {
  gimp: {
    purpose: 'Image editing — crop, resize, filters, layer compositing, export PNG/JPG/WebP',
    agents: ['merlina', 'lapina', 'lapina-instagram', 'lapina-tiktok'],
    useCases: [
      'Resize social media assets to platform specs (1080x1080, 9:16, etc.)',
      'Apply brand filters and overlays to campaign images',
      'Composite before/after comparison images for case studies',
      'Export optimized images for web (WebP, compressed JPG)',
    ],
  },
  blender: {
    purpose: '3D modeling, animation, rendering — product renders, motion graphics, demo videos',
    agents: ['merlina', 'indigo'],
    useCases: [
      'Create 3D mockups of KUPURI deliverables for viral demos',
      'Animate data visualizations for Morpho reports',
      'Render high-quality thumbnails for video content',
    ],
  },
  audacity: {
    purpose: 'Audio recording, editing, effects — podcast, voiceover, music',
    agents: ['lapina', 'lapina-tiktok', 'ivette-voice'],
    useCases: [
      'Normalize audio levels for TikTok/Instagram Reels',
      'Add intro/outro music to video exports',
      'Clean up background noise in client testimonial recordings',
    ],
  },
  inkscape: {
    purpose: 'Vector graphics — logos, icons, infographics, SVG assets',
    agents: ['merlina', 'lapina-instagram', 'lapina-linkedin'],
    useCases: [
      'Generate LinkedIn carousels as scalable SVG → export PDF',
      'Create brand-compliant infographics for educational content',
      'Produce icon sets for dashboard UI components',
    ],
  },
  kdenlive: {
    purpose: 'Video editing — cut, transitions, text overlays, color grading, export',
    agents: ['lapina', 'lapina-tiktok', 'lapina-instagram', 'indigo'],
    useCases: [
      'Edit viral demo videos with KUPURI brand animations',
      'Add captions and subtitles to TikTok/Reels automatically',
      'Create A/B/C variant videos from the same raw footage',
      'Export platform-specific formats (MP4 9:16 for TikTok, 16:9 for LinkedIn)',
    ],
  },
  libreoffice: {
    purpose: 'Documents, spreadsheets, presentations — reports, decks, proposals',
    agents: ['synthia-prime', 'morpho', 'clandestino', 'ralphy'],
    useCases: [
      'Generate client proposal decks from Clandestino deal data',
      'Export Morpho analytics reports as formatted XLSX/PDF',
      'Create council meeting minutes as shareable ODF documents',
      'Build client onboarding packages and contracts',
    ],
  },
  'obs-studio': {
    purpose: 'Live streaming and screen recording — capture, broadcast, virtual camera',
    agents: ['indigo', 'synthia-prime'],
    useCases: [
      'Record live demo sessions of Synthia 3.0 for viral content',
      'Stream LLM council meetings for Ivette to watch live',
      'Capture screen recordings of client results for case studies',
    ],
  },
  drawio: {
    purpose: 'Diagramming — flowcharts, architecture, process maps, org charts',
    agents: ['morpho', 'synthia-prime', 'ralphy'],
    useCases: [
      'Generate agent communication flow diagrams',
      'Create client-facing process maps for KUPURI methodology',
      'Visualize campaign funnel diagrams for Indigo reports',
    ],
  },
  anygen: {
    purpose: 'Generic cloud task runner — slides, docs, APIs via natural language',
    agents: ['synthia-prime', 'indigo', 'lapina'],
    useCases: [
      'Generate pitch decks from a text prompt',
      'Create data-driven documents from Morpho reports',
    ],
  },
};

// ─── Core execution ───────────────────────────────────────────────────────────

/**
 * Execute a CLI-Anything command for a given tool.
 * Always requests --json output for structured response.
 */
export async function executeCLI(
  tool: CLITool | string,
  command: string[],
  options: {
    projectFile?: string;
    timeout?: number;
    cwd?: string;
  } = {}
): Promise<CLIResult> {
  const start = Date.now();
  const bin = `cli-anything-${tool}`;
  const args = [
    '--json',
    ...(options.projectFile ? ['--project', options.projectFile] : []),
    ...command,
  ];

  try {
    const { stdout, stderr } = await execFileAsync(bin, args, {
      timeout: options.timeout ?? 60_000,
      cwd: options.cwd ?? process.cwd(),
      env: process.env,
    });

    let data: unknown;
    try {
      data = JSON.parse(stdout.trim());
    } catch {
      data = stdout.trim();
    }

    const result: CLIResult = {
      success: true,
      data,
      raw: stdout,
      tool,
      command,
      durationMs: Date.now() - start,
    };

    synthiaObservability.logEvent({
      type: 'success',
      summary: `CLI-Anything: ${tool} ${command[0]}`,
      data: { tool, command, durationMs: result.durationMs },
    });

    return result;
  } catch (err: unknown) {
    const error = err as { message?: string; stderr?: string; stdout?: string };
    const result: CLIResult = {
      success: false,
      error: error.message ?? String(err),
      raw: error.stderr ?? error.stdout ?? '',
      tool,
      command,
      durationMs: Date.now() - start,
    };

    synthiaObservability.logEvent({
      type: 'error',
      summary: `CLI-Anything error: ${tool} ${command[0]}`,
      data: { tool, command, error: result.error },
    });

    return result;
  }
}

/**
 * Discover which CLI-Anything tools are installed on this system.
 */
export function discoverTools(): ToolCapability[] {
  const known: (CLITool | string)[] = [
    'gimp', 'blender', 'audacity', 'inkscape',
    'kdenlive', 'shotcut', 'libreoffice', 'obs-studio', 'drawio', 'anygen',
  ];

  return known.map((tool) => {
    try {
      const version = execFileSync(`cli-anything-${tool}`, ['--version'], {
        timeout: 5000,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
      return { tool, installed: true, version };
    } catch {
      return { tool, installed: false };
    }
  });
}

/**
 * Run a multi-step workflow across tools.
 * Stops at first error unless continueOnError is true.
 */
export async function runWorkflow(
  steps: WorkflowStep[],
  options: { continueOnError?: boolean; projectFile?: string } = {}
): Promise<CLIResult[]> {
  const results: CLIResult[] = [];

  for (const step of steps) {
    const result = await executeCLI(step.tool, step.command, {
      projectFile: options.projectFile,
    });
    results.push(result);

    if (!result.success && !options.continueOnError) {
      break;
    }
  }

  return results;
}

// ─── High-level helpers ───────────────────────────────────────────────────────

/**
 * Produce a social media asset at the correct dimensions for a given platform.
 * Uses GIMP to resize and export the source image.
 */
export async function exportSocialAsset(params: {
  sourcePath: string;
  outputPath: string;
  platform: 'tiktok' | 'instagram' | 'linkedin' | 'twitter' | 'youtube_shorts';
}) {
  const PLATFORM_DIMS = {
    tiktok:        { w: 1080, h: 1920 }, // 9:16 vertical
    instagram:     { w: 1080, h: 1080 }, // 1:1 square
    linkedin:      { w: 1200, h: 627  }, // 1.91:1
    twitter:       { w: 1600, h: 900  }, // 16:9
    youtube_shorts:{ w: 1080, h: 1920 }, // 9:16 vertical
  };

  const { w, h } = PLATFORM_DIMS[params.platform];

  return runWorkflow([
    { tool: 'gimp', command: ['project', 'open', params.sourcePath], description: 'Open source image' },
    { tool: 'gimp', command: ['canvas', 'scale', '--width', String(w), '--height', String(h)], description: 'Resize to platform spec' },
    { tool: 'gimp', command: ['export', 'render', params.outputPath, '--format', path.extname(params.outputPath).slice(1) || 'png'], description: 'Export optimized image' },
  ]);
}

/**
 * Generate a video with branded captions from a raw clip + caption text.
 * Uses Kdenlive.
 */
export async function addCaptionsToVideo(params: {
  inputVideo: string;
  outputVideo: string;
  captions: Array<{ text: string; startSec: number; endSec: number }>;
  projectFile?: string;
}) {
  const steps: WorkflowStep[] = [
    { tool: 'kdenlive', command: ['project', 'open', params.inputVideo], description: 'Load video' },
    ...params.captions.map(cap => ({
      tool: 'kdenlive' as CLITool,
      command: [
        'track', 'add-text',
        '--text', cap.text,
        '--start', String(cap.startSec),
        '--end', String(cap.endSec),
        '--style', 'kupuri-brand',
      ],
      description: `Caption: "${cap.text}"`,
    })),
    { tool: 'kdenlive', command: ['export', 'render', params.outputVideo, '--format', 'mp4'], description: 'Export final video' },
  ];

  return runWorkflow(steps, { projectFile: params.projectFile });
}

/**
 * Generate a client report as a formatted XLSX + PDF.
 * Uses LibreOffice.
 */
export async function generateReport(params: {
  title: string;
  data: Record<string, unknown>[];
  outputDir: string;
}) {
  const xlsxPath = path.join(params.outputDir, `${params.title}.xlsx`);
  const pdfPath  = path.join(params.outputDir, `${params.title}.pdf`);

  if (!fs.existsSync(params.outputDir)) {
    fs.mkdirSync(params.outputDir, { recursive: true });
  }

  return runWorkflow([
    { tool: 'libreoffice', command: ['spreadsheet', 'new', '--name', params.title] },
    { tool: 'libreoffice', command: ['cell', 'set', 'A1', JSON.stringify(params.data)], description: 'Populate data' },
    { tool: 'libreoffice', command: ['export', 'render', xlsxPath, '--format', 'xlsx'] },
    { tool: 'libreoffice', command: ['export', 'render', pdfPath,  '--format', 'pdf'] },
  ]);
}

/**
 * Check whether a specific CLI tool is installed and usable.
 */
export function isToolInstalled(tool: CLITool | string): boolean {
  try {
    execFileSync(`cli-anything-${tool}`, ['--version'], {
      timeout: 3000,
      stdio: 'pipe',
    });
    return true;
  } catch {
    return false;
  }
}

export default {
  executeCLI,
  discoverTools,
  runWorkflow,
  exportSocialAsset,
  addCaptionsToVideo,
  generateReport,
  isToolInstalled,
  TOOL_DESCRIPTIONS,
};
