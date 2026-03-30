import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';

// Extend session type to include isAdmin
declare module 'next-auth' {
  interface Session {
    user: {
      isAdmin?: boolean;
    } & DefaultSession['user'];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedEmail = process.env.IVETTE_EMAIL || 'kupurimedia@gmail.com';
      if (user.email?.toLowerCase() !== allowedEmail.toLowerCase()) {
        console.log(`❌ Unauthorized attempt: ${user.email}`);
        return false;
      }
      return true;
    },
    async session({ session }) {
      if (session.user) {
        const allowedEmail = process.env.IVETTE_EMAIL || 'kupurimedia@gmail.com';
        session.user.isAdmin = session.user.email?.toLowerCase() === allowedEmail.toLowerCase();
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

// Server-side helpers
export async function getSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  if (!user?.email) return false;
  const allowedEmail = process.env.IVETTE_EMAIL || 'kupurimedia@gmail.com';
  return user.email.toLowerCase() === allowedEmail.toLowerCase();
}
