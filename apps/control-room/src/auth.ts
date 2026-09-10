/**
 * src/auth.ts — Canonical NextAuth v5 configuration for Synthia Control Room.
 */

// On Vercel Preview deployments, override NEXTAUTH_URL so NextAuth callbacks
// stay on the current preview domain instead of the production URL.
if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) {
  process.env.NEXTAUTH_URL = `https://${process.env.VERCEL_URL}`;
}

import NextAuth, { type DefaultSession, type JWT } from 'next-auth';
// Google provider temporarily disabled — re-enable when OAuth credentials are verified
// import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY!,
  );
}

// Role type
export type UserRole = 'admin' | 'operator' | 'viewer';

// Augment NextAuth session
declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role: UserRole;
      isAdmin: boolean;
      planId: string;
      subStatus: string;
    };
  }
  interface JWT {
    role?: UserRole;
    planId?: string;
    subStatus?: string;
  }
}

// ── Email list helpers ────────────────────────────────────────────────────────
const parseList = (v?: string): Set<string> =>
  new Set((v || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean));

const allowed = parseList(process.env.ALLOWED_EMAILS);
const admins = parseList(process.env.ADMIN_EMAILS);
const operators = parseList(process.env.OPERATOR_EMAILS);

export const roleFor = (email?: string | null): UserRole => {
  const e = (email || '').toLowerCase();
  if (admins.has(e)) return 'admin';
  if (operators.has(e)) return 'operator';
  return 'viewer';
};

export const isEmailAllowed = (email?: string | null): boolean => {
  const e = (email || '').toLowerCase();
  // Ivette is always allowed — this is her personal AI
  if (e === 'executiveusa@gmail.com') return true;
  // If no allowlist is configured beyond Ivette, only she can access
  if (allowed.size === 0 && admins.size === 0 && operators.size === 0) return false;
  return allowed.has(e) || admins.has(e) || operators.has(e);
};

// ── NextAuth v5 ───────────────────────────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true, // required for Vercel preview URLs
  providers: [
    // ── Passcode provider (temporary while Google OAuth is being configured) ──
    Credentials({
      id: 'passcode',
      name: 'Passcode',
      credentials: { passcode: { label: 'Código de acceso', type: 'password' } },
      async authorize() {
        // AUTH DISABLED FOR TESTING — accepts any input, always signs in as owner.
        // Re-enable: restore passcode check against process.env.SYNTHIA_PASSCODE
        return { id: 'owner', email: 'executiveusa@gmail.com', name: 'Ivette' };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user }) {
      return isEmailAllowed(user.email);
    },
    async jwt({ token, trigger }) {
      if (trigger === 'signIn' || !token.planId) {
        try {
          const supabase = getSupabaseAdmin();
          const { data } = await supabase
            .from('subscriptions')
            .select('plan_id, status')
            .eq('user_id', token.sub ?? '')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          token.planId = data?.plan_id ?? 'lector';
          token.subStatus = data?.status ?? 'none';
        } catch {
          token.planId = 'lector';
          token.subStatus = 'none';
        }
      }
      return token;
    },
    async session({ session, token }) {
      const role = roleFor(session.user?.email);
      if (session.user) {
        session.user.role = role;
        session.user.isAdmin = role === 'admin';
        session.user.planId = (token as JWT & { planId?: string }).planId ?? 'lector';
        session.user.subStatus = (token as JWT & { subStatus?: string }).subStatus ?? 'none';
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
