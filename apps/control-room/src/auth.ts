/**
 * src/auth.ts — Canonical NextAuth v5 configuration for Synthia Control Room.
 *
 * PATCH_002: Fixed domain drift — NEXTAUTH_URL must be explicitly set.
 * This file is the single source of truth for auth. auth.ts at root re-exports.
 */

import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';

// Role type
export type UserRole = 'admin' | 'operator' | 'viewer';

// Augment NextAuth session
declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      role: UserRole;
      isAdmin: boolean;
    };
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
  // If no allowlist is configured, all authenticated Google users are allowed
  if (allowed.size === 0 && admins.size === 0 && operators.size === 0) return true;
  return allowed.has(e) || admins.has(e) || operators.has(e);
};

// ── NextAuth v5 ───────────────────────────────────────────────────────────────
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      return isEmailAllowed(user.email);
    },
    async session({ session }) {
      const role = roleFor(session.user?.email);
      if (session.user) {
        session.user.role = role;
        session.user.isAdmin = role === 'admin';
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
