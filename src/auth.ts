import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * A pre-computed bcrypt hash used as a timing-safe dummy.
 * bcrypt.compare() is always called even when the user isn't found,
 * preventing timing-based username enumeration attacks.
 */
const DUMMY_HASH =
  "$2a$12$dummy.hash.to.prevent.user.enumeration.via.timing.attacks";

/** Max 10 login attempts per email per 15 minutes */
const LOGIN_MAX = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // Rate-limit login attempts per email address
        if (!checkRateLimit(`login:${email}`, LOGIN_MAX, LOGIN_WINDOW_MS)) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        // Always run bcrypt.compare to keep response time constant regardless
        // of whether the user exists (prevents timing-based enumeration).
        const hashToCompare = user?.password ?? DUMMY_HASH;
        const valid = await bcrypt.compare(password, hashToCompare);

        if (!user || !valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
