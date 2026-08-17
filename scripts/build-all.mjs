#!/usr/bin/env node
/**
 * build-all.mjs — Deterministic, fail-fast workspace builder.
 * Builds apps/web, apps/control-room, and apps/onboarding-flipbook.
 */
import { execSync } from 'node:child_process';

// Flipbook requires Rust + wasm-pack, which is not always available in the
// build image (notably Vercel). Treat it as optional: skip with a warning
// instead of fail-stopping the whole build. Set SKIP_FLIPBOOK=1 to force-skip,
// or ensure wasm-pack is on PATH to build it.
const skipFlipbook = process.env.SKIP_FLIPBOOK === '1';

const steps = [
  { label: 'build:web',      cmd: 'npm run build:web',           required: true  },
  { label: 'build:control',  cmd: 'npm run build:control',       required: true  },
  { label: 'build:flipbook', cmd: 'npm --prefix apps/onboarding-flipbook run build', required: !skipFlipbook },
];

let failed = false;
let skipped = [];
for (const { label, cmd, required } of steps) {
  console.log(`\n>>> [build-all] ${label}: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`>>> [build-all] ${label}: OK`);
  } catch (err) {
    if (label === 'build:flipbook' && !required) {
      console.error(`>>> [build-all] ${label}: SKIPPED (wasm-pack/Rust not available; set SKIP_FLIPBOOK=1 to silence)`);
      skipped.push(label);
      continue;
    }
    console.error(`>>> [build-all] FAILED: ${label}`);
    if (label === 'build:flipbook') {
      console.error(
        '\n[build-all] Flipbook build requires Rust + wasm-pack.\n' +
        '  Install: curl https://sh.rustup.rs -sSf | sh\n' +
        '           cargo install wasm-pack\n' +
        '  Or set SKIP_FLIPBOOK=1 to deploy without the flipbook sidecar.\n' +
        '  Then re-run: npm run build'
      );
    }
    failed = true;
    break;
  }
}

if (failed) {
  console.error('\n[build-all] Build FAILED — stopping.');
  process.exit(1);
}
if (skipped.length) {
  console.log(`\n[build-all] Optional steps skipped: ${skipped.join(', ')}`);
}
console.log('\n[build-all] All required builds PASSED.');
