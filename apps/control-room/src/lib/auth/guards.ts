import { auth } from '@/auth';

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new HttpError(401, 'UNAUTHORIZED');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.user.role !== 'admin') {
    throw new HttpError(403, 'FORBIDDEN_ADMIN_ONLY');
  }
  return session;
}

export async function requireOperatorOrAdmin() {
  const session = await requireUser();
  if (!['admin', 'operator'].includes(session.user.role)) {
    throw new HttpError(403, 'FORBIDDEN_OPERATOR_OR_ADMIN');
  }
  return session;
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
