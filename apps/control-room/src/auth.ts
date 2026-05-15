import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';

type UserRole = 'admin' | 'operator' | 'viewer';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & { role: UserRole; isAdmin: boolean };
  }
}

const parseList = (v?: string) => (v || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
const allowed = new Set(parseList(process.env.ALLOWED_EMAILS));
const admins = new Set(parseList(process.env.ADMIN_EMAILS));
const operators = new Set(parseList(process.env.OPERATOR_EMAILS));

const roleFor = (email?: string | null): UserRole => {
  const e = (email || '').toLowerCase();
  if (admins.has(e)) return 'admin';
  if (operators.has(e)) return 'operator';
  return 'viewer';
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google({ clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET! })],
  callbacks: {
    async signIn({ user }) { const e=(user.email||'').toLowerCase(); return allowed.size===0 || allowed.has(e) || admins.has(e) || operators.has(e); },
    async session({ session }) { const role=roleFor(session.user?.email); if (session.user) { session.user.role=role; session.user.isAdmin=role==='admin'; } return session; }
  },
  pages: { signIn: '/auth/signin', error: '/auth/signin' },
  secret: process.env.NEXTAUTH_SECRET
});
