#!/usr/bin/env node
/**
 * Blender MCP Server — Kupuri Media™ / Synthia Studio
 *
 * "We don't build websites. We build worlds."
 *
 * Tools:
 *   blender_create_sphere_world   — generate a complete 3D meeting world for sphere agents
 *   blender_render_scene          — render a Blender scene to image/video
 *   blender_export_glb            — export scene as GLB for Three.js / web delivery
 *   blender_add_sphere_agent      — add a sphere agent entity to a world scene
 *   blender_animate_council       — create council meeting animation with all spheres
 *   blender_apply_location_style  — style a world with meeting location aesthetics
 *   blender_run_script            — run arbitrary Blender Python script (advanced)
 *   blender_list_worlds           — list all available world scenes
 *
 * Execution: spawns blender --background --python script.py
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import * as dotenv from 'dotenv';
import { spawn } from 'child_process';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../apps/control-room/.env.local') });

const BLENDER_BIN = process.env.BLENDER_BIN || '/usr/bin/blender';
const RENDERS_DIR = resolve(__dirname, '../renders');
const WORLDS_DIR = resolve(__dirname, '../worlds');

// Ensure output directories exist
[RENDERS_DIR, WORLDS_DIR].forEach(d => { if (!existsSync(d)) mkdirSync(d, { recursive: true }); });

// Sphere → color mapping for Blender materials
const SPHERE_COLORS: Record<string, [number, number, number]> = {
  synthia:       [0.545, 0.361, 0.965],   // #8b5cf6 violet
  alex:          [0.831, 0.686, 0.216],   // #d4af37 gold
  cazadora:      [0.937, 0.267, 0.267],   // #ef4444 red
  forjadora:     [0.133, 0.773, 0.333],   // #22c55e green
  seductora:     [0.918, 0.702, 0.031],   // #eab308 yellow-gold
  consejo:       [0.114, 0.306, 0.847],   // #1d4ed8 blue
  'dr-economia': [0.976, 0.451, 0.086],   // #f97316 orange
  'dra-cultura': [0.957, 0.247, 0.369],   // #f43f5e rose
  'ing-teknos':  [0.024, 0.714, 0.831],   // #06b6d4 cyan
  'la-vigilante':[0.392, 0.455, 0.545],   // #64748b slate
};

const LOCATION_ENV: Record<string, { sky: [number,number,number]; ground: [number,number,number]; fog: number }> = {
  'santa-maria-ribera':     { sky: [0.1, 0.22, 0.1],   ground: [0.35, 0.55, 0.34], fog: 0.02 },
  'balcon-del-zocalo':      { sky: [0.1, 0.06, 0.02],  ground: [0.28, 0.22, 0.08], fog: 0.01 },
  'manantiales-xochimilco': { sky: [0.03, 0.08, 0.12], ground: [0.06, 0.14, 0.18], fog: 0.06 },
  'la-panorama-vallarta':   { sky: [0.05, 0.12, 0.22], ground: [0.2, 0.12, 0.05],  fog: 0.015 },
};

/** Run Blender in background mode with a Python script */
function runBlender(scriptPath: string, args: string[] = []): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(BLENDER_BIN, [
      '--background',
      '--python', scriptPath,
      '--',
      ...args,
    ], { timeout: 120_000 });

    let stdout = '';
    let stderr = '';
    proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });

    proc.on('close', (code) => {
      resolve({ stdout, stderr, code: code ?? 1 });
    });

    proc.on('error', (err) => {
      reject(new Error(`Blender spawn failed: ${err.message}. Is blender installed at ${BLENDER_BIN}?`));
    });
  });
}

/** Write a temp Python script and run it */
async function runBlenderScript(pythonScript: string, args: string[] = []) {
  const scriptPath = join(tmpdir(), `blender_${randomUUID()}.py`);
  writeFileSync(scriptPath, pythonScript, 'utf8');
  const result = await runBlender(scriptPath, args);
  return result;
}

// ─── Blender Python script generators ──────────────────────────────────────────

function genSphereWorldScript(params: {
  location: string;
  sphere_ids: string[];
  output_path: string;
  format: 'GLB' | 'FBX' | 'OBJ';
}): string {
  const env = LOCATION_ENV[params.location] || LOCATION_ENV['santa-maria-ribera'];
  const sphereLines = params.sphere_ids.map((id, i) => {
    const color = SPHERE_COLORS[id] || [1, 1, 1];
    const angle = (i / params.sphere_ids.length) * 2 * Math.PI;
    const radius = 3.0;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return `
# Sphere: ${id}
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.4, location=(${x.toFixed(3)}, ${y.toFixed(3)}, 1.2))
sphere_${i} = bpy.context.active_object
sphere_${i}.name = "sphere_${id}"
mat_${i} = bpy.data.materials.new(name="mat_${id}")
mat_${i}.use_nodes = True
bsdf_${i} = mat_${i}.node_tree.nodes["Principled BSDF"]
bsdf_${i}.inputs["Base Color"].default_value = (${color[0]}, ${color[1]}, ${color[2]}, 1.0)
bsdf_${i}.inputs["Emission"].default_value = (${color[0]}, ${color[1]}, ${color[2]}, 1.0)
bsdf_${i}.inputs["Emission Strength"].default_value = 2.0
bsdf_${i}.inputs["Metallic"].default_value = 0.8
bsdf_${i}.inputs["Roughness"].default_value = 0.1
sphere_${i}.data.materials.append(mat_${i})
`;
  }).join('\n');

  return `
import bpy
import math

# Clear scene
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

# World background
world = bpy.data.worlds.new("SynthiaWorld_${params.location}")
bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (${env.sky[0]}, ${env.sky[1]}, ${env.sky[2]}, 1.0)
bg.inputs["Strength"].default_value = 1.5

# Ground plane
bpy.ops.mesh.primitive_plane_add(size=20, location=(0, 0, 0))
ground = bpy.context.active_object
ground.name = "ground"
mat_ground = bpy.data.materials.new(name="mat_ground")
mat_ground.use_nodes = True
bsdf = mat_ground.node_tree.nodes["Principled BSDF"]
bsdf.inputs["Base Color"].default_value = (${env.ground[0]}, ${env.ground[1]}, ${env.ground[2]}, 1.0)
bsdf.inputs["Roughness"].default_value = 0.8
ground.data.materials.append(mat_ground)

# Meeting table (central disc)
bpy.ops.mesh.primitive_cylinder_add(radius=1.5, depth=0.1, location=(0, 0, 0.8))
table = bpy.context.active_object
table.name = "meeting_table"
mat_table = bpy.data.materials.new(name="mat_table")
mat_table.use_nodes = True
bsdf_t = mat_table.node_tree.nodes["Principled BSDF"]
bsdf_t.inputs["Base Color"].default_value = (0.05, 0.05, 0.1, 1.0)
bsdf_t.inputs["Metallic"].default_value = 0.9
bsdf_t.inputs["Roughness"].default_value = 0.05
table.data.materials.append(mat_table)

# Sphere agents
${sphereLines}

# Key light
bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
sun = bpy.context.active_object
sun.data.energy = 3.0

# Fill light
bpy.ops.object.light_add(type='AREA', location=(-3, -3, 4))
fill = bpy.context.active_object
fill.data.energy = 500.0
fill.data.color = (${env.sky[0]}, ${env.sky[1]}, ${env.sky[2]})

# Camera
bpy.ops.object.camera_add(location=(0, -8, 5))
cam = bpy.context.active_object
bpy.context.scene.camera = cam
import mathutils
cam.rotation_euler = mathutils.Euler((math.radians(55), 0, 0), 'XYZ')

# Export
bpy.ops.export_scene.gltf(
    filepath="${params.output_path}",
    export_format='GLB',
    export_apply=True,
    export_cameras=True,
    export_lights=True,
)
print("BLENDER_EXPORT_SUCCESS: ${params.output_path}")
`;
}

// ─── MCP Server ────────────────────────────────────────────────────────────────

const server = new Server(
  { name: 'mcp-blender', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'blender_create_sphere_world',
      description: 'Generate a complete 3D GLB world for sphere council meetings using Blender. Exports as GLB for use in Three.js. "We build worlds, not websites."',
      inputSchema: {
        type: 'object',
        properties: {
          location:    { type: 'string', enum: ['santa-maria-ribera', 'balcon-del-zocalo', 'manantiales-xochimilco', 'la-panorama-vallarta'], description: 'Meeting world location' },
          sphere_ids:  { type: 'array', items: { type: 'string' }, description: 'Sphere agent IDs to place in the scene' },
          world_name:  { type: 'string', description: 'Name for the output world file' },
        },
        required: ['location', 'sphere_ids'],
      },
    },
    {
      name: 'blender_render_scene',
      description: 'Render a Blender .blend scene to a PNG or EXR image',
      inputSchema: {
        type: 'object',
        properties: {
          blend_file:  { type: 'string', description: 'Path to .blend file' },
          output_path: { type: 'string', description: 'Output image path' },
          resolution_x: { type: 'number', default: 1920 },
          resolution_y: { type: 'number', default: 1080 },
          samples:     { type: 'number', description: 'Cycles render samples', default: 64 },
          engine:      { type: 'string', enum: ['CYCLES', 'EEVEE'], default: 'EEVEE' },
        },
        required: ['blend_file', 'output_path'],
      },
    },
    {
      name: 'blender_export_glb',
      description: 'Export a Blender scene to GLB format for Three.js delivery',
      inputSchema: {
        type: 'object',
        properties: {
          blend_file:  { type: 'string', description: 'Source .blend file path' },
          output_path: { type: 'string', description: 'Output .glb file path' },
        },
        required: ['blend_file', 'output_path'],
      },
    },
    {
      name: 'blender_animate_council',
      description: 'Create a council meeting animation with all 10 sphere agents orbiting the central meeting table',
      inputSchema: {
        type: 'object',
        properties: {
          location:    { type: 'string', description: 'Meeting world location ID' },
          duration_sec: { type: 'number', description: 'Animation duration in seconds', default: 10 },
          fps:         { type: 'number', default: 30 },
          output_path: { type: 'string', description: 'Output .glb path' },
        },
        required: ['location'],
      },
    },
    {
      name: 'blender_run_script',
      description: 'Run an arbitrary Blender Python script for advanced world customization',
      inputSchema: {
        type: 'object',
        properties: {
          python_script: { type: 'string', description: 'Blender Python script content' },
          args:          { type: 'array', items: { type: 'string' }, description: 'Additional CLI args' },
        },
        required: ['python_script'],
      },
    },
    {
      name: 'blender_list_worlds',
      description: 'List all available generated sphere world GLB files',
      inputSchema: { type: 'object', properties: {} },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'blender_create_sphere_world': {
        const { location, sphere_ids, world_name } = args as {
          location: string; sphere_ids: string[]; world_name?: string;
        };
        const filename = world_name || `world_${location}_${Date.now()}`;
        const output_path = join(WORLDS_DIR, `${filename}.glb`);
        const script = genSphereWorldScript({ location, sphere_ids, output_path, format: 'GLB' });
        const result = await runBlenderScript(script);

        const success = result.stdout.includes('BLENDER_EXPORT_SUCCESS') || result.code === 0;
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success,
              output_path: success ? output_path : null,
              location,
              sphere_ids,
              blender_log: result.stderr.slice(-500), // last 500 chars of blender log
              note: success ? 'GLB ready for Three.js delivery' : 'Check blender installation',
            }, null, 2),
          }],
        };
      }

      case 'blender_render_scene': {
        const { blend_file, output_path, resolution_x = 1920, resolution_y = 1080, samples = 64, engine = 'EEVEE' } = args as {
          blend_file: string; output_path: string; resolution_x?: number; resolution_y?: number; samples?: number; engine?: string;
        };
        const script = `
import bpy
bpy.ops.wm.open_mainfile(filepath="${blend_file}")
scene = bpy.context.scene
scene.render.engine = '${engine}'
scene.render.resolution_x = ${resolution_x}
scene.render.resolution_y = ${resolution_y}
scene.render.filepath = "${output_path}"
if '${engine}' == 'CYCLES':
    scene.cycles.samples = ${samples}
bpy.ops.render.render(write_still=True)
print("RENDER_COMPLETE: ${output_path}")
`;
        const result = await runBlenderScript(script);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: result.code === 0, output_path, engine }, null, 2),
          }],
        };
      }

      case 'blender_export_glb': {
        const { blend_file, output_path } = args as { blend_file: string; output_path: string };
        const script = `
import bpy
bpy.ops.wm.open_mainfile(filepath="${blend_file}")
bpy.ops.export_scene.gltf(filepath="${output_path}", export_format='GLB', export_apply=True)
print("GLB_EXPORT_COMPLETE")
`;
        const result = await runBlenderScript(script);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ success: result.code === 0, output_path }, null, 2),
          }],
        };
      }

      case 'blender_animate_council': {
        const { location, duration_sec = 10, fps = 30, output_path } = args as {
          location: string; duration_sec?: number; fps?: number; output_path?: string;
        };
        const allSpheres = Object.keys(SPHERE_COLORS);
        const outPath = output_path || join(WORLDS_DIR, `council_${location}_${Date.now()}.glb`);
        const totalFrames = duration_sec * fps;
        const env = LOCATION_ENV[location] || LOCATION_ENV['santa-maria-ribera'];

        const script = `
import bpy
import math

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete()

bpy.context.scene.frame_end = ${totalFrames}
bpy.context.scene.render.fps = ${fps}

# World
world = bpy.data.worlds.new("CouncilWorld")
bpy.context.scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes["Background"]
bg.inputs["Color"].default_value = (${env.sky[0]}, ${env.sky[1]}, ${env.sky[2]}, 1.0)
bg.inputs["Strength"].default_value = 1.5

# Table
bpy.ops.mesh.primitive_cylinder_add(radius=1.5, depth=0.1, location=(0, 0, 0.8))
table = bpy.context.active_object
table.name = "council_table"

# Animate spheres in orbit
spheres = ${JSON.stringify(allSpheres)}
colors = ${JSON.stringify(Object.values(SPHERE_COLORS))}

for i, (sphere_id, color) in enumerate(zip(spheres, colors)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(3, 0, 1.5))
    obj = bpy.context.active_object
    obj.name = f"sphere_{sphere_id}"
    mat = bpy.data.materials.new(name=f"mat_{sphere_id}")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Emission"].default_value = (*color, 1.0)
    bsdf.inputs["Emission Strength"].default_value = 1.5
    obj.data.materials.append(mat)

    # Orbit animation keyframes
    n = len(spheres)
    for frame in range(0, ${totalFrames} + 1, ${fps // 4}):
        angle = (2 * math.pi * i / n) + (2 * math.pi * frame / ${totalFrames})
        x = 3.0 * math.cos(angle)
        y = 3.0 * math.sin(angle)
        obj.location = (x, y, 1.5)
        obj.keyframe_insert(data_path="location", frame=frame)

bpy.ops.object.camera_add(location=(0, -10, 6))
cam = bpy.context.active_object
bpy.context.scene.camera = cam
import mathutils
cam.rotation_euler = mathutils.Euler((math.radians(50), 0, 0), 'XYZ')

bpy.ops.export_scene.gltf(
    filepath="${outPath}",
    export_format='GLB',
    export_apply=False,
    export_animations=True,
    export_cameras=True,
)
print("COUNCIL_ANIMATION_COMPLETE: ${outPath}")
`;
        const result = await runBlenderScript(script);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: result.code === 0,
              output_path: outPath,
              location,
              duration_sec,
              fps,
              spheres_animated: allSpheres.length,
            }, null, 2),
          }],
        };
      }

      case 'blender_run_script': {
        const { python_script, args: scriptArgs = [] } = args as { python_script: string; args?: string[] };
        const result = await runBlenderScript(python_script, scriptArgs);
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              success: result.code === 0,
              stdout: result.stdout.slice(-1000),
              stderr: result.stderr.slice(-500),
              exit_code: result.code,
            }, null, 2),
          }],
        };
      }

      case 'blender_list_worlds': {
        const { readdirSync } = await import('fs');
        const files = existsSync(WORLDS_DIR)
          ? readdirSync(WORLDS_DIR).filter(f => f.endsWith('.glb') || f.endsWith('.blend'))
          : [];
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({ worlds_dir: WORLDS_DIR, files, count: files.length }, null, 2),
          }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[mcp-blender] Server running — Blender World Builder active');
  if (!existsSync(BLENDER_BIN)) {
    console.error(`[mcp-blender] WARNING: Blender not found at ${BLENDER_BIN}. Tools will fail until installed.`);
  }
}

main().catch((err) => {
  console.error('[mcp-blender] Fatal:', err);
  process.exit(1);
});
