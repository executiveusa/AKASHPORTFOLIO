import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const ALLOWED_EMAIL = "kupurimedia@gmail.com";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isCockpit = nextUrl.pathname.startsWith("/cockpit");
      if (isCockpit) return isLoggedIn;
      return true;
    },
    async signIn({ user }) {
      return user.email === ALLOWED_EMAIL;
    },
    async session({ session, token }) {
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
});
