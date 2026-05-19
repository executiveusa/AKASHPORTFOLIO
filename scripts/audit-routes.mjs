#!/usr/bin/env node
/**
 * audit-routes.mjs — Enumerate and classify all API routes.
 * Produces machine-readable output listing every route.ts in apps/control-room/src/app/api.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const API_BASE = 'apps/control-room/src/app/api';

if (!existsSync(API_BASE)) {
  console.error(`[audit-routes] ERROR: API base path not found: ${API_BASE}`);
  process.exit(1);
}

const out = execSync(`find ${API_BASE} -type f -name 'route.ts'`, { encoding: 'utf8' });
const routes = out.trim().split('\n').filter(Boolean).sort();

console.log(`[audit-routes] Found ${routes.length} API route files\n`);

const results = [];
for (const routeFile of routes) {
  const routePath = routeFile
    .replace('apps/control-room/src/app', '')
    .replace('/route.ts', '')
    || '/';
  
  let content = '';
  try { content = readFileSync(routeFile, 'utf8'); } catch {}
  
  const methods = [];
  if (content.match(/export\s+(async\s+)?function\s+GET/)) methods.push('GET');
  if (content.match(/export\s+(async\s+)?function\s+POST/)) methods.push('POST');
  if (content.match(/export\s+(async\s+)?function\s+PUT/)) methods.push('PUT');
  if (content.match(/export\s+(async\s+)?function\s+PATCH/)) methods.push('PATCH');
  if (content.match(/export\s+(async\s+)?function\s+DELETE/)) methods.push('DELETE');

  const hasRequireAdmin = content.includes('requireAdmin');
  const hasRequireOperator = content.includes('requireOperatorOrAdmin');
  const hasRequireUser = content.includes('requireUser');
  const hasRequireCron = content.includes('requireCron');
  const hasRequireWebhook = content.includes('requireWebhookSignature');
  const hasToolPolicy = content.includes('tool-policy') || content.includes('assertToolAllowed');
  
  let guard = 'none';
  if (hasRequireAdmin) guard = 'requireAdmin';
  else if (hasRequireOperator) guard = 'requireOperatorOrAdmin';
  else if (hasRequireUser) guard = 'requireUser';
  else if (hasRequireCron) guard = 'requireCron';
  else if (hasRequireWebhook) guard = 'requireWebhookSignature';

  const entry = {
    file: routeFile,
    route: routePath,
    methods: methods.join(','),
    guard,
    tool_policy: hasToolPolicy,
  };
  results.push(entry);
  console.log(JSON.stringify(entry));
}

console.log(`\n[audit-routes] Summary: ${results.length} routes, ${results.filter(r => r.guard === 'none').length} unguarded`);
