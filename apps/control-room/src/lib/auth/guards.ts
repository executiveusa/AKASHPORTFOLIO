import { auth } from '@/auth';

export async function requireUser() { const s = await auth(); if (!s?.user?.email) throw new Error('UNAUTHORIZED'); return s; }
export async function requireAdmin() { const s=await requireUser(); if (s.user.role!=='admin') throw new Error('FORBIDDEN'); return s; }
export async function requireOperatorOrAdmin() { const s=await requireUser(); if (!['admin','operator'].includes(s.user.role)) throw new Error('FORBIDDEN'); return s; }
export async function requireCron(req: Request) { if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) throw new Error('FORBIDDEN'); }
export async function requireWebhookSignature(req: Request) { if (req.headers.get('x-webhook-secret') !== process.env.WEBHOOK_SECRET) throw new Error('FORBIDDEN'); }
