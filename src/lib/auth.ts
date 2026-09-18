import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const AUTH_SECRET = process.env.AUTH_SECRET || "fusionia-dev-secret-change-me";

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signin",
    newUser: "/signup",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis.");
        }
        const email = credentials.email.toLowerCase().trim();
        const user = await db.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          throw new Error("Aucun compte avec cet email.");
        }
        const valid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!valid) {
          throw new Error("Mot de passe incorrect.");
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Only query DB when user first signs in (user object is present)
      // On subsequent calls, just return the existing token — no DB query
      if (user) {
        const id = (user as { id?: string }).id;
        if (id) {
          token.id = id;
          // Fetch user data once at sign-in
          try {
            const dbUser = await db.user.findUnique({
              where: { id },
              select: { credits: true, plan: true, role: true, email: true },
            });
            if (dbUser) {
              token.credits = dbUser.credits;
              token.plan = dbUser.plan;
              token.role = dbUser.role;
              token.email = dbUser.email;
            }
          } catch (err) {
            console.error('[auth] jwt sign-in DB error:', err instanceof Error ? err.message : String(err));
          }
        }
      }
      // Return token WITHOUT DB query on subsequent calls
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { credits?: number }).credits =
          token.credits as number;
        (session.user as { plan?: string }).plan = token.plan as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
};

export { AUTH_SECRET };
