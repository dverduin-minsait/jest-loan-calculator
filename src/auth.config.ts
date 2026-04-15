import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth config — no Prisma, no Node.js builtins.
 * Used by middleware.ts, which runs on the Edge runtime.
 * The full authorize() logic (DB lookup + bcrypt) lives in src/auth.ts.
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
};
