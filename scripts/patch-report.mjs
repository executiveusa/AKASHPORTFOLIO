#!/usr/bin/env node
/**
 * patch-report.mjs — Emits patch report metadata.
 */
import { execSync } from 'node:child_process';

const patchId = 'PATCH_002_SYNTHIA_CONTROL_ROOM_PRODUCTION';
let commit = 'unknown';
let branch = 'unknown';
try {
  commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
} catch {}

const report = {
  patch_id: patchId,
  branch,
  commit,
  generated_at: new Date().toISOString(),
  status: 'completed',
};

console.log(JSON.stringify(report, null, 2));
