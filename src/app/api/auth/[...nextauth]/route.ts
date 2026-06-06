import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Endpoint catch-all de NextAuth. Maneja /api/auth/signin, /api/auth/callback,
 * /api/auth/signout, /api/auth/session, /api/auth/csrf, etc.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
