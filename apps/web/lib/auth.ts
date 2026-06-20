import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { getServerSession } from "next-auth";

const publicKeycloakIssuer = process.env.KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/success-day";
const internalKeycloakIssuer = process.env.KEYCLOAK_INTERNAL_ISSUER ?? publicKeycloakIssuer;

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      issuer: publicKeycloakIssuer,
      wellKnown: `${internalKeycloakIssuer}/.well-known/openid-configuration`,
      authorization: {
        url: `${publicKeycloakIssuer}/protocol/openid-connect/auth`,
        params: { scope: "openid email profile" }
      },
      token: `${internalKeycloakIssuer}/protocol/openid-connect/token`,
      userinfo: `${internalKeycloakIssuer}/protocol/openid-connect/userinfo`,
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? "success-day-web",
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET ?? "success-day-secret"
    })
  ],
  pages: {
    signIn: "/login"
  },
  callbacks: {
    async redirect({ baseUrl }) {
      return `${baseUrl}/employees`;
    }
  }
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getAuthSession();

  if (!session) {
    return null;
  }

  return session;
}
