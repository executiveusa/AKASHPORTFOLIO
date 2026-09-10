/**
 * Auth guards — AUTH BYPASS ACTIVE FOR TESTING.
 * requireUser() always returns owner session. No NextAuth calls.
 * Restore: uncomment real auth block and re-add `import { auth } from '@/auth'`.
 */

import type { UserRole } from '@/auth';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const BYPASS_SESSION = {
  user: {
    id: 'owner',
    email: 'executiveusa@gmail.com',
    name: 'Ivette',
    role: 'admin' as UserRole,
    isAdmin: true,
    planId: 'admin',
    subStatus: 'active',
  },
  expires: new Date(Date.now() + 86400_000).toISOString(),
};

export async function requireUser() {
  // AUTH BYPASS — return owner identity without hitting NextAuth
  return BYPASS_SESSION;
}

export async function requireAdmin() {
  return BYPASS_SESSION;
}

export async function requireOperatorOrAdmin() {
  return BYPASS_SESSION;
}

export function requireCron(req: Request) {
  if (!process.env.CRON_SECRET) {
    throw new HttpError(500, 'CRON_SECRET_NOT_CONFIGURED');
  }
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    throw new HttpError(403, 'FORBIDDEN_CRON');
  }
}

export function requireWebhookSignature(req: Request) {
  if (!process.env.WEBHOOK_SECRET) {
    throw new HttpError(500, 'WEBHOOK_SECRET_NOT_CONFIGURED');
  }
  if (req.headers.get('x-webhook-secret') !== process.env.WEBHOOK_SECRET) {
    throw new HttpError(403, 'FORBIDDEN_WEBHOOK');
  }
}

export function toErrorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: error.status,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: false, error: 'INTERNAL_ERROR' }), {
    status: 500,
    headers: { 'content-type': 'application/json' },
  });
}
