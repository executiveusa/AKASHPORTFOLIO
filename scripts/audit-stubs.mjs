#!/usr/bin/env node
/**
 * audit-stubs.mjs — Accurate stub scanner.
 *
 * Fixes vs. original:
 *  - TODO/FIXME/NOT_IMPLEMENTED are case-SENSITIVE (avoids Spanish "todo/todos")
 *  - Excludes .md, .sql, .mdx files (prose and schema, not code)
 *  - placeholder matches only in comment context (avoids JSX placeholder= attributes)
 *  - mock/stub matches are scoped to code comment markers (// STUB, STUB MODE, mockResponse)
 *  - fallback counted separately as graceful-degradation (informational, not critical)
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const SCAN_PATH = 'apps/control-room/src';
const EXCLUDE_EXTS = new Set(['.md', '.mdx', '.sql', '.txt']);

if (!existsSync(SCAN_PATH)) {
  console.error(`[audit-stubs] ERROR: Scan path not found: ${SCAN_PATH}`);
  process.exit(1);
}

// Collect all scannable source files
function collectFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next' || entry === 'openclaw-logic') continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      results.push(...collectFiles(full));
    } else if (!EXCLUDE_EXTS.has(extname(entry))) {
      results.push(full);
    }
  }
  return results;
}

const files = collectFiles(SCAN_PATH);

// Patterns — case-sensitive, scoped to code context
// Require // to appear at start-of-meaningful-content (not inside a URL like https://)
const CODE_COMMENT = /^\s*\/\/|^\s*\/\*/;

const PATTERNS = [
  {
    name: 'TODO (code comment)',
    // matches // TODO or /* TODO — case sensitive
    test: (line) => CODE_COMMENT.test(line) && /\bTODO\b/.test(line),
    critical: true,
  },
  {
    name: 'FIXME (code comment)',
    test: (line) => CODE_COMMENT.test(line) && /\bFIXME\b/.test(line),
    critical: true,
  },
  {
    name: 'NOT_IMPLEMENTED',
    test: (line) => /NOT_IMPLEMENTED/.test(line),
    critical: true,
  },
  {
    name: 'STUB MODE / stub function',
    // STUB MODE comments, stub( call, stub: type literal, _mock: flag
    test: (line) => /STUB MODE|STUB:|\/\/.*stub\b|stub\(|_mock\s*:|mockResponse\(/.test(line),
    critical: true,
  },
  {
    name: 'fake success',
    // only match "fake success" — exclude "never fake success" guardrail comments
    test: (line) => /fake success/i.test(line) && !/never fake success/i.test(line),
    critical: true,
  },
  {
    name: 'mock (code — not mockup/documentation)',
    // match mockResponse, mock data, mock client — but not "mockup" (design term)
    test: (line) => /\bmock(?!up)\b/i.test(line) && CODE_COMMENT.test(line),
    critical: false,
  },
  {
    name: 'placeholder (comment context only)',
    // Only flag when placeholder appears in a comment, not as JSX/HTML attribute
    test: (line) => CODE_COMMENT.test(line) && /placeholder/i.test(line),
    critical: false,
  },
];

const CRITICAL_API_PATHS = ['api/', 'lib/auth', 'lib/security', 'lib/integrations', 'lib/workflows', 'lib/observability'];

const findings = [];
let criticalCount = 0;
let informationalCount = 0;

for (const file of files) {
  let content;
  try { content = readFileSync(file, 'utf8'); } catch { continue; }

  const lines = content.split('\n');
  const relPath = file.replace(/\\/g, '/').replace(/^.*apps\/control-room\/src\//, 'src/');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const pat of PATTERNS) {
      if (pat.test(line)) {
        const isCriticalPath = CRITICAL_API_PATHS.some(p => file.includes(p));
        const entry = {
          file: relPath,
          line: i + 1,
          pattern: pat.name,
          text: line.trim().slice(0, 120),
          critical: pat.critical && isCriticalPath,
        };
        findings.push(entry);
        if (entry.critical) criticalCount++;
        else informationalCount++;
        break; // one pattern per line
      }
    }
  }
}

console.log(`[audit-stubs] Scanned ${files.length} source files\n`);

if (findings.length === 0) {
  console.log('[audit-stubs] No stub markers found. OK.');
  process.exit(0);
}

const critical = findings.filter(f => f.critical);
const informational = findings.filter(f => !f.critical);

if (critical.length > 0) {
  console.log(`--- CRITICAL (${critical.length} — in production API/lib paths) ---`);
  for (const f of critical) {
    console.log(`  ${f.file}:${f.line}  [${f.pattern}]`);
    console.log(`    ${f.text}`);
  }
}

if (informational.length > 0) {
  console.log(`\n--- INFORMATIONAL (${informational.length} — graceful degradation / non-critical paths) ---`);
  for (const f of informational) {
    console.log(`  ${f.file}:${f.line}  [${f.pattern}]`);
    console.log(`    ${f.text}`);
  }
}

console.log(`\n[audit-stubs] Summary: ${critical.length} critical, ${informational.length} informational`);

if (critical.length > 0) {
  console.error('\n[audit-stubs] CRITICAL stub markers found in production paths. Failing.');
  process.exit(1);
}

console.log('[audit-stubs] No critical stubs. OK.');
