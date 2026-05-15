#!/usr/bin/env node
import { execSync } from 'node:child_process';
const patterns = ['TODO', 'mock', 'stub', 'fake success', 'fallback'];
let findings = [];
for (const p of patterns) {
  try { findings.push(execSync(`rg -n -i "${p}" apps/control-room/src`, {encoding:'utf8'})); } catch {}
}
console.log(findings.join('\n') || 'No stub markers found.');
