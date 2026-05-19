/**
 * Integration status — env check + safe active probe.
 * No secrets leaked. Machine-readable output.
 * Persists last-checked state to DB if available.
 */

import { db } from '@/lib/db/client';

type IntegrationKey =
  | 'DIFY_BASE_URL'
  | 'DIFY_API_KEY'
  | 'LANGFUSE_HOST'
  | 'LANGFUSE_PUBLIC_KEY'
  | 'LANGFUSE_SECRET_KEY'
  | 'OPEN_WEBUI_BASE_URL'
  | 'SUPABASE_URL'
  | 'SUPABASE_SERVICE_ROLE_KEY'
  | 'NEXTAUTH_URL'
  | 'GOOGLE_CLIENT_ID'
  | 'AUTH_GOOGLE_ID'
  | 'GOOGLE_CLIENT_SECRET'
  | 'AUTH_GOOGLE_SECRET';

export interface IntegrationStatus {
  key: string;
  configured: boolean;
  reachable?: boolean | null;
  checkedAt: string;
  error?: string;
}

const ENV_KEYS: IntegrationKey[] = [
  'DIFY_BASE_URL',
  'DIFY_API_KEY',
  'LANGFUSE_HOST',
  'LANGFUSE_PUBLIC_KEY',
  'LANGFUSE_SECRET_KEY',
  'OPEN_WEBUI_BASE_URL',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'AUTH_GOOGLE_ID',
  'GOOGLE_CLIENT_SECRET',
  'AUTH_GOOGLE_SECRET',
];

/** Returns env-based integration status (synchronous, no network calls). */
export function getIntegrationStatus(): IntegrationStatus[] {
  const checkedAt = new Date().toISOString();
  return ENV_KEYS.map((k) => ({
    key: k,
    configured: Boolean(process.env[k]),
    reachable: null, // populated by async probe
    checkedAt,
  }));
}

/** Probes a URL for reachability without leaking response bodies. */
async function probe(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
      redirect: 'follow',
    });
    return res.status < 500;
  } catch {
    return false;
  }
}

/** Full active check — probes configured service URLs. */
export async function getIntegrationStatusFull(): Promise<IntegrationStatus[]> {
  const checkedAt = new Date().toISOString();
  const statuses: IntegrationStatus[] = [];

  const difyBase = process.env.DIFY_BASE_URL;
  const langfuseHost = process.env.LANGFUSE_HOST || process.env.LANGFUSE_BASE_URL;
  const openWebuiBase = process.env.OPEN_WEBUI_BASE_URL;
  const supabaseUrl = process.env.SUPABASE_URL;

  // Dify
  statuses.push({
    key: 'dify',
    configured: Boolean(difyBase && process.env.DIFY_API_KEY),
    reachable: difyBase ? await probe(`${difyBase.replace(/\/$/, '')}/health`) : null,
    checkedAt,
  });

  // Langfuse
  statuses.push({
    key: 'langfuse',
    configured: Boolean(langfuseHost && process.env.LANGFUSE_PUBLIC_KEY && process.env.LANGFUSE_SECRET_KEY),
    reachable: langfuseHost ? await probe(`${langfuseHost.replace(/\/$/, '')}/api/public/health`) : null,
    checkedAt,
  });

  // Open WebUI
  statuses.push({
    key: 'open_webui',
    configured: Boolean(openWebuiBase),
    reachable: openWebuiBase ? await probe(`${openWebuiBase.replace(/\/$/, '')}/health`) : null,
    checkedAt,
  });

  // Supabase
  statuses.push({
    key: 'supabase',
    configured: Boolean(supabaseUrl && process.env.SUPABASE_SERVICE_ROLE_KEY),
    reachable: supabaseUrl ? await probe(`${supabaseUrl.replace(/\/$/, '')}/rest/v1/`) : null,
    checkedAt,
  });

  // Persist to DB if available
  if (db) {
    for (const s of statuses) {
      try {
        await db.from('integration_status')
          .upsert({ id: s.key, configured: s.configured, reachable: s.reachable, checked_at: checkedAt }, { onConflict: 'id' });
      } catch { /* ignore */ }
    }
  }

  return statuses;
}
