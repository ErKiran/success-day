import { cookies } from "next/headers";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { keycloakLogoutUrl } from "@/lib/auth";

const authCookieNames = [
  "success-day-saml-session",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
  "next-auth.pkce.code_verifier",
  "__Secure-next-auth.pkce.code_verifier",
  "next-auth.state",
  "__Secure-next-auth.state",
  "next-auth.nonce",
  "__Secure-next-auth.nonce"
];

export async function POST(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET ?? "change-me" });
  const cookieStore = await cookies();

  for (const name of authCookieNames) {
    cookieStore.delete(name);
  }

  return Response.json({
    ok: true,
    logoutUrl: token?.idToken ? keycloakLogoutUrl(token.idToken, "/login") : "/login"
  });
}
