import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { getServerSession } from "next-auth";

const publicKeycloakIssuer = process.env.KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/success-day";
const internalKeycloakIssuer = process.env.KEYCLOAK_INTERNAL_ISSUER ?? publicKeycloakIssuer;

const rolePermissions: Record<string, string[]> = {
  "success-day-admin": ["admin:employees", "admin:scim"],
  "success-day-developer": ["developer:sso", "developer:saml"]
};

type KeycloakAccessToken = {
  realm_access?: {
    roles?: string[];
  };
};

function decodeAccessToken(token?: string): KeycloakAccessToken {
  if (!token) {
    return {};
  }

  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64url").toString("utf8");
    return JSON.parse(decoded) as KeycloakAccessToken;
  } catch {
    return {};
  }
}

function permissionsForRoles(roles: string[]) {
  return Array.from(new Set(roles.flatMap((role) => rolePermissions[role] ?? [])));
}

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
    async jwt({ token, account }) {
      if (account?.access_token) {
        const accessToken = decodeAccessToken(account.access_token);
        const roles = accessToken.realm_access?.roles ?? [];
        token.roles = roles;
        token.permissions = permissionsForRoles(roles);
      }

      return token;
    },
    async session({ session, token }) {
      const roles = Array.isArray(token.roles) ? token.roles.filter((role): role is string => typeof role === "string") : [];
      const permissions = Array.isArray(token.permissions) ? token.permissions.filter((permission): permission is string => typeof permission === "string") : [];

      session.user = {
        ...session.user,
        roles,
        permissions
      };

      return session;
    },
    async redirect({ baseUrl }) {
      return `${baseUrl}/dashboard`;
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

export function hasPermission(session: Awaited<ReturnType<typeof getAuthSession>> | null, permission: string) {
  return Boolean(session?.user?.permissions?.includes(permission));
}

export async function requirePermission(permission: string) {
  const session = await requireSession();

  if (!session || !hasPermission(session, permission)) {
    return null;
  }

  return session;
}
