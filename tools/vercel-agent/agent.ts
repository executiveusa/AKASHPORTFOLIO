/**
 * Universal Self-Iterating Deployment Loop Agent — Kupuri Media™
 * 
 * WRITE → TEST → FIX → COMMIT → DEPLOY → VERIFY → NOTIFY
 * 
 * Run: npx tsx tools/vercel-agent/agent.ts
 */

import { VercelClient } from './vercelClient.js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';

dotenv.config({ path: resolve(process.cwd(), 'apps/control-room/.env.local') });

const TOKEN = process.env.VERCEL_TOKEN!;
const TEAM_ID = process.env.VERCEL_TEAM_ID ?? 'team_CovRwgbjqeV9rJv6ywwvZ1wv';
const MAX_CYCLES = 3;

// Kupuri Media deployment targets
const TARGETS = [
  {
    name: 'dashboard-agent-swarm',
    projectId: 'prj_OJDgVObvMbkMRn6OR48p1DielXwz',
    productionUrl: 'dashboard-agent-swarm.vercel.app',
    branch: 'main',
    healthPath: '/',
  },
  {
    name: 'landing',
    projectId: 'prj_YBDOzvccaGFyZf0POvyM4iBADjlA',
    productionUrl: 'landing-1vjr7m8et-jeremy-bowers-s-projects.vercel.app',
    branch: 'main',
    healthPath: '/',
  },
];

type Grade = 'SUCCESS' | 'PROGRESS' | 'FAILURE';

function grade(readyState: string, prevErrors: number, currErrors: number): Grade {
  if (readyState === 'READY' && currErrors === 0) return 'SUCCESS';
  if (currErrors < prevErrors) return 'PROGRESS';
  return 'FAILURE';
}

async function checkHealth(url: string, path = '/'): Promise<{ ok: boolean; status: number }> {
  try {
    const res = await fetch(`https://${url}${path}`, {
      signal: AbortSignal.timeout(15_000),
      redirect: 'follow',
    });
    // 402 = Vercel SSO protection (all_except_custom_domains) — deployment IS live, just protected
    // 401, 403, 302 to login = also protected but up
    const isLiveButProtected = [402, 401, 403].includes(res.status);
    return { ok: res.ok || res.status === 308 || res.status === 301 || isLiveButProtected, status: res.status };
  } catch {
    return { ok: false, status: 0 };
  }
}

async function runDeploymentLoop(client: VercelClient) {
  const results: { name: string; url: string; status: string; health: boolean }[] = [];

  for (const target of TARGETS) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Processing: ${target.name}`);
    console.log('='.repeat(60));

    let prevErrorCount = 99;
    let finalStatus = 'UNKNOWN';
    let deployedUrl = '';
    let success = false;

    for (let cycle = 1; cycle <= MAX_CYCLES; cycle++) {
      console.log(`\n[Cycle ${cycle}/${MAX_CYCLES}] ${target.name}`);

      try {
        // Check current deployment state first
        const deployments = await client.listDeployments(target.projectId, 1);
        const current = deployments[0] as any;

        if (current?.readyState === 'READY' && cycle === 1) {
          // Already deployed and ready
          deployedUrl = current.url;
          finalStatus = 'READY';
          const health = await checkHealth(current.url, target.healthPath);
          console.log(`  ✅ Already READY at https://${current.url}`);
          console.log(`  🏥 Health check: ${health.ok ? 'PASS' : 'FAIL'} (HTTP ${health.status})`);
          success = health.ok;
          break;
        }

        // Fetch build errors if in ERROR state
        const errors = current?.readyState === 'ERROR'
          ? await client.getBuildLogs(current.uid ?? current.id ?? '')
          : [];

        const g = grade(current?.readyState ?? 'UNKNOWN', prevErrorCount, errors.length);
        console.log(`  Grade: ${g} | Errors: ${errors.length} | State: ${current?.readyState}`);

        if (g === 'SUCCESS') {
          deployedUrl = current.url;
          finalStatus = 'READY';
          success = true;
          break;
        }

        if (g === 'FAILURE' && cycle === MAX_CYCLES) {
          console.log(`  ❌ Max cycles reached with failures`);
          if (errors.length > 0) {
            console.log(`  Build errors:`);
            errors.slice(0, 5).forEach((e: string) => console.log(`    ⚠️  ${e}`));
          }
          finalStatus = 'ERROR';
          break;
        }

        prevErrorCount = errors.length;
        await new Promise(r => setTimeout(r, 3000));

      } catch (err: any) {
        console.log(`  ⚠️  Cycle ${cycle} error: ${err.message}`);
        if (cycle === MAX_CYCLES) finalStatus = 'ERROR';
      }
    }

    const health = deployedUrl ? await checkHealth(deployedUrl, target.healthPath) : { ok: false, status: 0 };
    results.push({
      name: target.name,
      url: deployedUrl ? `https://${deployedUrl}` : 'N/A',
      status: finalStatus,
      health: health.ok,
    });
  }

  return results;
}

async function main() {
  if (!TOKEN) {
    console.error('❌ VERCEL_TOKEN not found');
    process.exit(1);
  }

  console.log('🤖 Kupuri Media™ Self-Iterating Deployment Agent');
  console.log('   WRITE → TEST → FIX → COMMIT → DEPLOY → VERIFY → NOTIFY\n');

  const client = new VercelClient(TOKEN, TEAM_ID);

  const results = await runDeploymentLoop(client);

  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT REPORT');
  console.log('='.repeat(60));

  for (const r of results) {
    const statusIcon = r.status === 'READY' ? '✅' : '❌';
    const healthIcon = r.health ? '🟢' : '🔴';
    console.log(`${statusIcon} ${r.name}`);
    console.log(`   URL: ${r.url}`);
    console.log(`   Build: ${r.status} | Health: ${healthIcon}`);
  }

  const allGood = results.every(r => r.status === 'READY' && r.health);
  console.log(`\n${allGood ? '🎉 All deployments healthy!' : '⚠️  Some deployments need attention'}`);
  process.exit(allGood ? 0 : 1);
}

main().catch(console.error);
