import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";

const config: NextAuthConfig = {
  providers: [
    {
      id: "email",
      name: "Email",
      type: "email",
      from: "noreply@kupuri.media",
      server: "",
      maxAge: 24 * 60 * 60,
      sendVerificationRequest: async ({ identifier, url }) => {
        // Implement via Supabase magic link in production
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as { tenantId?: string }).tenantId;
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { tenantId?: unknown; role?: unknown }).tenantId = token.tenantId;
        (session.user as { tenantId?: unknown; role?: unknown }).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    verifyRequest: "/?verify=1",
  },
};

const handler = NextAuth(config);
export { handler as GET, handler as POST };
