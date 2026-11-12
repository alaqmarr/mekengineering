import NextAuth, { type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, ensureDbReady } from "@/db";
import { users } from "@/db/schema";

const DEV_FALLBACK_SECRET =
  "mek-engineering-corp-fallback-secret-1968-secunderabad";

const isProd = process.env.NODE_ENV === "production";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    DEV_FALLBACK_SECRET,
  cookies: {
    sessionToken: {
      name: isProd ? "__Secure-mekeng.session-token" : "mekeng.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
      },
    },
  },
  logger: {
    error(error) {
      // Suppress noisy JWTSessionError if secret ever rotates; session safely resolves to null
      if (error?.name === "JWTSessionError") return;
      console.error("[auth]", error);
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");

        if (!email || !password) {
          return null;
        }

        await ensureDbReady();
        const admin = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .get();
        if (!admin) {
          return null;
        }

        const isValid = await bcrypt.compare(password, admin.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: String(admin.id),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || "");
        (session.user as { role?: string }).role = String(
          token.role || "admin"
        );
      }
      return session;
    },
  },
});

export async function getSafeSession(): Promise<Session | null> {
  try {
    return await auth();
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getSafeSession();
  return Boolean(
    session?.user && (session.user as { role?: string }).role === "admin"
  );
}
