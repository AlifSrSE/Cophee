import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@cophee/database";
import { verify } from "argon2";

export const { handlers, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const rawUser = await prisma.user.findUnique({
          where: { email },
          include: {
            role: true,
            employee: true,
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = rawUser as any;

        if (!user || !user.employee || !user.isActive) {
          return null;
        }

        const passwordHash = user.passwordHash as string;
        const isValid = await verify(passwordHash, password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          role: (user as any).role.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          permissions: (user as any).role.permissions,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).permissions = token.permissions as Record<string, unknown>;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
