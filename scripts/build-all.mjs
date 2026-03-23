#!/usr/bin/env node
/**
 * Unified Build Script — Kupuri Media Multi-App Deploy
 * Builds all apps and assembles them for Vercel deployment.
 *
 * Flow:
 *   1. Build apps/web (Vite) → copy dist to control-room/public/
 *   2. Copy onboarding flipbook → control-room/public/onboarding/
 *   3. Build apps/control-room (Next.js)
 */

import { execSync } from 'child_process';
import { cpSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

function run(cmd, cwd) {
  console.log(`\n▶ [${cwd}] ${cmd}`);
  execSync(cmd, { cwd: resolve(root, cwd), stdio: 'inherit' });
}

// ── Step 1: Build public landing (Vite) ──────────────────
console.log('\n═══ Step 1/3: Building public landing (apps/web) ═══');
if (existsSync(resolve(root, 'apps/web/package.json'))) {
  run('npm install --legacy-peer-deps', 'apps/web');
  run('npx vite build', 'apps/web');

  const dest = resolve(root, 'apps/control-room/public');
  const src = resolve(root, 'apps/web/dist');

  // Copy Vite output into Next.js public/
  for (const dir of ['assets', 'fonts', 'images']) {
    const s = resolve(src, dir);
    const d = resolve(dest, dir);
    if (existsSync(s)) {
      mkdirSync(d, { recursive: true });
      cpSync(s, d, { recursive: true });
      console.log(`  ✓ ${dir}/`);
    }
  }
  // Copy HTML files
  for (const file of ['index.html', 'contact.html']) {
    const s = resolve(src, file);
    if (existsSync(s)) {
      cpSync(s, resolve(dest, file));
      console.log(`  ✓ ${file}`);
    }
  }
} else {
  console.log('  ⏭ apps/web not found — skipping');
}

// ── Step 2: Copy onboarding flipbook ─────────────────────
console.log('\n═══ Step 2/3: Copying onboarding flipbook ═══');
const flipbookSrc = resolve(root, 'apps/onboarding-flipbook');
const flipbookDest = resolve(root, 'apps/control-room/public/onboarding');

if (existsSync(resolve(flipbookSrc, 'index.html'))) {
  mkdirSync(flipbookDest, { recursive: true });
  cpSync(resolve(flipbookSrc, 'index.html'), resolve(flipbookDest, 'index.html'));
  console.log('  ✓ onboarding/index.html');

  if (existsSync(resolve(flipbookSrc, 'sw.js'))) {
    cpSync(resolve(flipbookSrc, 'sw.js'), resolve(flipbookDest, 'sw.js'));
    console.log('  ✓ onboarding/sw.js');
  }
} else {
  console.log('  ⏭ flipbook not found — skipping');
}

// ── Step 3: Build Next.js control room ───────────────────
console.log('\n═══ Step 3/3: Building control room (Next.js) ═══');
run('npm install --legacy-peer-deps', 'apps/control-room');
run('npx next build', 'apps/control-room');

console.log('\n✅ All apps built successfully');
