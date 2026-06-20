const publicKeycloakIssuer = process.env.KEYCLOAK_ISSUER ?? "http://localhost:8080/realms/success-day";
const internalKeycloakIssuer = process.env.KEYCLOAK_INTERNAL_ISSUER ?? publicKeycloakIssuer;
const keycloakBaseUrl = internalKeycloakIssuer.replace(/\/realms\/[^/]+$/, "");
const keycloakRealm = internalKeycloakIssuer.match(/\/realms\/([^/]+)$/)?.[1] ?? "success-day";

type KeycloakUser = {
  id: string;
  username?: string;
  email?: string;
};

type KeycloakRole = {
  name: string;
};

async function getAdminToken() {
  const response = await fetch(`${keycloakBaseUrl}/realms/master/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "password",
      client_id: "admin-cli",
      username: process.env.KEYCLOAK_ADMIN_USERNAME ?? "admin",
      password: process.env.KEYCLOAK_ADMIN_PASSWORD ?? "admin"
    })
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate to Keycloak admin API");
  }

  const payload = (await response.json()) as { access_token?: string };

  if (!payload.access_token) {
    throw new Error("Keycloak admin API did not return an access token");
  }

  return payload.access_token;
}

async function keycloakFetch(path: string) {
  const token = await getAdminToken();
  const response = await fetch(`${keycloakBaseUrl}/admin/realms/${keycloakRealm}${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!response.ok) {
    throw new Error(`Keycloak admin request failed: ${response.status}`);
  }

  return response;
}

export async function findKeycloakUser({ username, email }: { username?: string | null; email?: string | null }) {
  const queries = [username ? `username=${encodeURIComponent(username)}` : "", email ? `email=${encodeURIComponent(email)}` : ""].filter(Boolean);

  for (const query of queries) {
    const response = await keycloakFetch(`/users?${query}&exact=true`);
    const users = (await response.json()) as KeycloakUser[];
    const user = users.find((candidate) => candidate.username === username || candidate.email === email);

    if (user?.id) {
      return user;
    }
  }

  return null;
}

export async function getKeycloakUserRoles(userId: string) {
  const response = await keycloakFetch(`/users/${userId}/role-mappings/realm`);
  const roles = (await response.json()) as KeycloakRole[];

  return roles.map((role) => role.name).filter(Boolean);
}
