/**
 * POST /api/design/dispatch
 *
 * Bridge from any Sphere agent → Synthia Design Studio.
 * Accepts a design brief, writes it to the Vibe Graph, and returns
 * a task-queue entry that the design studio picks up.
 *
 * Any sphere can call this. FORJADORA routes structural/UI briefs here.
 * DRA-CULTURA routes brand/content design here.
 * ING-TEKNOS routes component/system design here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { vibeIngest } from '@/lib/vibe-graph';
import type { SphereAgentId } from '@/shared/council-events';

// Valid callers — all spheres can request design work
const VALID_CALLERS = [
  'forjadora',
  'dra-cultura',
  'ing-teknos',
  'seductora',
  'cazadora',
  'consejo',
  'dr-economia',
  'alex',
  'synthia',
  'system',
] as const;

// Design request types — maps to the routing table in synthia-superdesign/tasks/ROUTING.md
const DESIGN_TYPES = [
  'ui-component',     // Single React/HTML component
  'landing-page',     // Full landing page
  'dashboard',        // Dashboard screen
  'brand-asset',      // Logo, color, typography system
  'motion',           // Animation / Remotion video
  'audio',            // Audio branding (ElevenLabs/Suno)
  '3d-asset',         // Three.js / Blender GLB
  'full-site',        // Multi-page site factory
] as const;

type DesignType = typeof DESIGN_TYPES[number];

interface DispatchBody {
  requestedBy: string;       // Sphere agent ID
  designType: DesignType;
  projectName: string;       // e.g. "querencia-homepage"
  brief: string;             // Natural language design brief
  udecFloor?: number;        // Optional — defaults to 8.5
  priority?: 'low' | 'normal' | 'high';
  relatedNodeIds?: string[]; // Vibe Graph node IDs this relates to
}

export async function POST(req: NextRequest) {
  let body: DispatchBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.requestedBy || !VALID_CALLERS.includes(body.requestedBy as typeof VALID_CALLERS[number])) {
    return NextResponse.json(
      { error: `requestedBy must be one of: ${VALID_CALLERS.join(', ')}` },
      { status: 400 },
    );
  }

  if (!body.designType || !DESIGN_TYPES.includes(body.designType)) {
    return NextResponse.json(
      { error: `designType must be one of: ${DESIGN_TYPES.join(', ')}` },
      { status: 400 },
    );
  }

  if (!body.projectName || !body.brief) {
    return NextResponse.json({ error: 'projectName and brief are required' }, { status: 400 });
  }

  const udecFloor = body.udecFloor ?? 8.5;
  const priority = body.priority ?? 'normal';
  const taskId = `design-${Date.now()}-${body.projectName.toLowerCase().replace(/\s+/g, '-')}`;

  // 1. Build the task file content (this is what the design studio will read)
  const taskContent = `---
id: ${taskId}
requestedBy: ${body.requestedBy}
designType: ${body.designType}
projectName: ${body.projectName}
status: pending
priority: ${priority}
udecFloor: ${udecFloor}
createdAt: ${new Date().toISOString()}
vibeGraphAgent: synthia-design
---

## Design Brief

${body.brief}

## Dispatch Context

Requested by: **${body.requestedBy}** via \`POST /api/design/dispatch\`
Design type: **${body.designType}**
UDEC quality floor: **${udecFloor}** (nothing ships below this)

## Expected Output

- RALPHY produces 3 parallel HTML/component variations
- LENA scores all three against UDEC 14 axes
- Highest scoring variation (if ≥ ${udecFloor}) → approved to \`examples/\`
- Approved output → POST back to Vibe Graph as \`design_output\` node
- Task file moves to \`tasks/processed/\`

## Vibe Graph Callback

When output is approved, POST to:
  \`${process.env.NEXT_PUBLIC_APP_URL ?? 'https://kupuri-media-cdmx.vercel.app'}/api/vibe\`

Body:
\`\`\`json
{
  "agentId": "synthia",
  "kind": "resource",
  "label": "${body.projectName} — approved design output",
  "content": "<file path + UDEC score>",
  "tags": ["design-output", "${body.designType}", "${body.projectName}"],
  "metadata": { "taskId": "${taskId}", "requestedBy": "${body.requestedBy}", "udecScore": 0 }
}
\`\`\`
`;

  // 2. Ingest the dispatch request into the Vibe Graph so spheres can track it
  const vibeNode = await vibeIngest({
    agentId: body.requestedBy as SphereAgentId,
    kind: 'task',
    label: `Design dispatch: ${body.projectName} [${body.designType}]`,
    content: `${body.brief.substring(0, 500)}... | UDEC floor: ${udecFloor} | Task: ${taskId}`,
    tags: ['design-dispatch', body.designType, body.projectName, `priority:${priority}`],
    metadata: {
      taskId,
      designType: body.designType,
      udecFloor,
      priority,
      status: 'pending',
    },
    relatesToIds: body.relatedNodeIds,
  });

  return NextResponse.json(
    {
      taskId,
      status: 'dispatched',
      vibeNodeId: vibeNode.id,
      instructions: {
        step1: `Write the following task file to: synthia-superdesign/tasks/queue/${taskId}.task.md`,
        step2: 'HERMES will pick it up on next cycle and route to RALPHY × 3',
        step3: `Track progress via GET /api/vibe/context?agent=synthia or check tasks/queue/`,
        taskContent,
      },
      designStudio: {
        repo: 'https://github.com/executiveusa/synthia-superdesign',
        queuePath: `tasks/queue/${taskId}.task.md`,
        outputPath: `.superdesign/design_iterations/${body.projectName}/`,
        udecFloor,
      },
    },
    { status: 202 },
  );
}

export async function GET(req: NextRequest) {
  // Return active design tasks from Vibe Graph
  const { vibeIngest: _, getVibeContext } = await import('@/lib/vibe-graph');
  const ctx = await getVibeContext('synthia' as SphereAgentId);
  const allNodes = [...(ctx.ownNodes ?? []), ...(ctx.sharedNodes ?? [])];
  const designTasks = allNodes.filter(
    (n: { tags?: string[] }) => n.tags?.includes('design-dispatch')
  );

  return NextResponse.json({
    activeTasks: designTasks.length,
    tasks: designTasks,
    designStudio: 'https://github.com/executiveusa/synthia-superdesign',
  });
}
