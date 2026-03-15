/**
 * Vercel Deployment Status Checker — Kupuri Media™
 * Run: npx tsx tools/vercel-agent/check-deployment.ts
 */

import { VercelClient } from './vercelClient.js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), 'apps/control-room/.env.local') });

const TOKEN = process.env.VERCEL_TOKEN!;
const TEAM_ID = process.env.VERCEL_TEAM_ID ?? 'team_CovRwgbjqeV9rJv6ywwvZ1wv';

// Known Kupuri Media projects
const PROJECTS = [
  { name: 'dashboard-agent-swarm (control-room)', id: 'prj_OJDgVObvMbkMRn6OR48p1DielXwz' },
  { name: 'landing (apps/web)', id: 'prj_YBDOzvccaGFyZf0POvyM4iBADjlA' },
  { name: 'kupuri-studios', id: 'prj_JfSEkcMZbZoXOESR9yBGsZjRodEP' },
  { name: 'akash-frontend', id: 'prj_LPVAL11Ktp3jTVV80thWgPlCzxIr' },
];

async function main() {
  if (!TOKEN) {
    console.error('❌ VERCEL_TOKEN not found in environment');
    process.exit(1);
  }

  const client = new VercelClient(TOKEN, TEAM_ID);
  console.log('🔍 Checking Kupuri Media Vercel Deployments...\n');

  for (const proj of PROJECTS) {
    try {
      const deployments = await client.listDeployments(proj.id, 3);
      const latest = deployments[0];
      const status = latest ? latest.readyState : 'unknown';
      const icon = status === 'READY' ? '✅' : status === 'ERROR' ? '❌' : '⏳';
      const url = latest ? `https://${latest.url}` : 'no url';
      console.log(`${icon} ${proj.name}`);
      console.log(`   Status: ${status}`);
      console.log(`   URL: ${url}`);

      if (status === 'ERROR') {
        const logs = await client.getBuildLogs((latest as any).uid ?? (latest as any).id ?? '');
        if (logs.length > 0) {
          console.log('   Errors:');
          logs.slice(0, 5).forEach(l => console.log(`     - ${l}`));
        }
      }
      console.log('');
    } catch (err: any) {
      console.log(`⚠️  ${proj.name}: ${err.message}\n`);
    }
  }
}

main().catch(console.error);
