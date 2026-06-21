#!/usr/bin/env node
/**
 * build-all.mjs — Deterministic, fail-fast workspace builder.
 * Builds apps/web, apps/control-room, and apps/onboarding-flipbook.
 */
import { execSync } from 'node:child_process';

const steps = [
  { label: 'build:web',      cmd: 'npm run build:web' },
  { label: 'build:control',  cmd: 'npm run build:control' },
  { label: 'build:flipbook', cmd: 'npm --prefix apps/onboarding-flipbook run build' },
];

let failed = false;
for (const { label, cmd } of steps) {
  console.log(`\n>>> [build-all] ${label}: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`>>> [build-all] ${label}: OK`);
  } catch (err) {
    console.error(`>>> [build-all] FAILED: ${label}`);
    if (label === 'build:flipbook') {
      console.error(
        '\n[build-all] Flipbook build requires Rust + wasm-pack.\n' +
        '  Install: curl https://sh.rustup.rs -sSf | sh\n' +
        '           cargo install wasm-pack\n' +
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
console.log('\n[build-all] All builds PASSED.');
