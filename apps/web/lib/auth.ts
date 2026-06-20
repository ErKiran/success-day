import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { getServerSession } from "next-auth";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

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

export function keycloakLogoutUrl(idToken?: string, callbackUrl = "/login") {
  const appBaseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const postLogoutRedirectUri = new URL(callbackUrl, appBaseUrl).toString();
  const url = new URL(`${publicKeycloakIssuer}/protocol/openid-connect/logout`);
  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

  if (idToken) {
    url.searchParams.set("id_token_hint", idToken);
  }

  return url.toString();
}

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

export function permissionsForRoles(roles: string[]) {
  return Array.from(new Set(roles.flatMap((role) => rolePermissions[role] ?? [])));
}

type SamlSessionPayload = {
  name?: string | null;
  email?: string | null;
  roles: string[];
};

function samlSessionSecret() {
  return new TextEncoder().encode(process.env.NEXTAUTH_SECRET ?? "change-me");
}

export async function createSamlSessionCookie(payload: SamlSessionPayload) {
  const token = await new SignJWT({
    name: payload.name ?? undefined,
    email: payload.email ?? undefined,
    roles: payload.roles,
    permissions: permissionsForRoles(payload.roles),
    authMethod: "saml"
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(samlSessionSecret());

  const cookieStore = await cookies();
  cookieStore.set("success-day-saml-session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

async function getSamlSession() {
  const token = (await cookies()).get("success-day-saml-session")?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, samlSessionSecret());
    const roles = Array.isArray(payload.roles) ? payload.roles.filter((role): role is string => typeof role === "string") : [];
    const permissions = Array.isArray(payload.permissions) ? payload.permissions.filter((permission): permission is string => typeof permission === "string") : [];

    return {
      user: {
        name: typeof payload.name === "string" ? payload.name : null,
        email: typeof payload.email === "string" ? payload.email : null,
        image: null,
        roles,
        permissions
      },
      expires: new Date(Date.now() + 60 * 60 * 8 * 1000).toISOString()
    };
  } catch {
    return null;
  }
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

      if (account?.id_token) {
        token.idToken = account.id_token;
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
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

      return `${baseUrl}/dashboard`;
    }
  }
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = (await getSamlSession()) ?? (await getAuthSession());

  if (!session) {
    return null;
  }

  return session;
}

export function hasPermission(session: { user?: { permissions?: string[] } } | null, permission: string) {
  return Boolean(session?.user?.permissions?.includes(permission));
}

export async function requirePermission(permission: string) {
  const session = await requireSession();

  if (!session || !hasPermission(session, permission)) {
    return null;
  }

  return session;
}
