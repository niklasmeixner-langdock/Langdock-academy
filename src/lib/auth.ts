import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./db";
import { getWorkspacesForEmail } from "./langdock-db";

const DEV_BYPASS = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";

const devProvider = Credentials({
  name: "Dev Login",
  credentials: {
    email: { label: "Email", type: "text" },
  },
  async authorize(credentials) {
    if (!DEV_BYPASS) return null;
    const email = (credentials?.email as string) || "dev@langdock.com";

    const user = await prisma.user.upsert({
      where: { email },
      create: { email, name: "Dev User" },
      update: {},
    });

    // Auto-resolve workspace from Langdock DB
    const workspaces = await getWorkspacesForEmail(email);
    if (workspaces.length > 0 && !user.workspaceId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { workspaceId: workspaces[0].id },
      });
    }

    return { id: user.id, email: user.email, name: user.name };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: DEV_BYPASS ? "jwt" : "database" },
  providers: [
    ...(DEV_BYPASS ? [devProvider] : []),
    ...(process.env.AUTH_GOOGLE_ID ? [Google] : []),
    ...(process.env.AUTH_MICROSOFT_ENTRA_ID_ID
      ? [
          MicrosoftEntraID({
            clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
            clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
            issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: "/login",
  },
  events: {
    // Auto-resolve workspace after any sign-in (Google/Microsoft)
    async signIn({ user }) {
      if (!user.email || !user.id) return;

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { workspaceId: true },
      });

      // Only resolve if not already set
      if (dbUser?.workspaceId) return;

      const workspaces = await getWorkspacesForEmail(user.email);
      if (workspaces.length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { workspaceId: workspaces[0].id },
        });
      }
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token, user }) {
      if (token?.id) {
        session.user.id = token.id as string;
      } else if (user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
