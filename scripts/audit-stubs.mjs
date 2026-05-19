#!/usr/bin/env node
/**
 * audit-stubs.mjs — Fail-fast stub scanner.
 * Exits non-zero if production-critical stub markers are found.
 */
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const CRITICAL_PATTERNS = [
  'TODO',
  'FIXME',
  'mock',
  'stub',
  'fake success',
  'fallback',
  'placeholder',
  'NOT_IMPLEMENTED',
];

const SCAN_PATH = 'apps/control-room/src';
const IGNORE_DIRS = ['--glob', '!**/node_modules/**', '--glob', '!**/.next/**', '--glob', '!**/openclaw-logic/**'];

if (!existsSync(SCAN_PATH)) {
  console.error(`[audit-stubs] ERROR: Scan path not found: ${SCAN_PATH}`);
  process.exit(1);
}

let totalFindings = 0;
const findings = [];

for (const pattern of CRITICAL_PATTERNS) {
  try {
    const result = execSync(
      `rg -n -i --with-filename ${IGNORE_DIRS.join(' ')} "${pattern}" ${SCAN_PATH}`,
      { encoding: 'utf8' }
    );
    if (result.trim()) {
      const lines = result.trim().split('\n');
      totalFindings += lines.length;
      findings.push(`--- PATTERN: ${pattern} (${lines.length} match(es)) ---`);
      findings.push(result.trim());
    }
  } catch {
    // rg exits 1 if no matches — that's fine
  }
}

if (totalFindings > 0) {
  console.log(`[audit-stubs] Found ${totalFindings} stub marker(s):\n`);
  console.log(findings.join('\n'));
  // Classify as critical if any findings exist in key production paths
  const criticalPaths = ['api/', 'lib/auth', 'lib/security', 'lib/integrations', 'lib/workflows', 'lib/observability'];
  const hasCritical = findings.some(f => criticalPaths.some(p => f.includes(p)));
  if (hasCritical) {
    console.error('\n[audit-stubs] CRITICAL stub markers found in production paths. Failing.');
    process.exit(1);
  }
  console.warn('\n[audit-stubs] Non-critical stub markers found (non-production paths). Exiting 0.');
} else {
  console.log('[audit-stubs] No stub markers found. OK.');
}
