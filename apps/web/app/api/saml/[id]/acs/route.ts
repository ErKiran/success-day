import { prisma } from "@/lib/prisma";
import { createSamlSessionCookie, permissionsForRoles } from "@/lib/auth";
import { findKeycloakUser, getKeycloakUserRoles } from "@/lib/keycloak";
import { buildUserFromSamlProfile, createSamlServiceProvider, samlServiceProviderUrls } from "@/lib/saml";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const configuration = await prisma.samlSsoConfiguration.findUnique({ where: { id } });

  if (!configuration || !configuration.enabled) {
    return Response.json({ error: "SAML configuration not found" }, { status: 404 });
  }

  const formData = await request.formData();
  const samlResponse = formData.get("SAMLResponse");
  const relayState = formData.get("RelayState");

  if (typeof samlResponse !== "string" || samlResponse.length === 0) {
    return Response.json({ error: "Missing SAMLResponse" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  const saml = createSamlServiceProvider(configuration, baseUrl);

  try {
    const result = await saml.validatePostResponseAsync({
      SAMLResponse: samlResponse,
      ...(typeof relayState === "string" ? { RelayState: relayState } : {})
    });

    if (!result.profile) {
      return Response.json({ error: "SAML response did not contain a user profile" }, { status: 400 });
    }

    const samlUser = buildUserFromSamlProfile(result.profile, configuration);
    const keycloakUser = await findKeycloakUser({
      username: samlUser.username,
      email: samlUser.email
    });

    if (!keycloakUser?.id) {
      return new Response("SAML user does not exist in Keycloak realm", { status: 403 });
    }

    const keycloakRoles = await getKeycloakUserRoles(keycloakUser.id);
    const roles = keycloakRoles.length > 0 ? keycloakRoles : samlUser.roles;
    const redirectUrl = dashboardRedirectForRoles(roles);

    if (!redirectUrl) {
      return new Response("SAML user does not have any valid roles", { status: 403 });
    }

    await createSamlSessionCookie({
      name: samlUser.name,
      email: samlUser.email,
      roles
    });

    const { entityId, acsUrl } = samlServiceProviderUrls(baseUrl, configuration.id);

    if (request.headers.get("accept")?.includes("application/json")) {
      return Response.json({
        authenticated: true,
        redirectUrl,
        configurationId: configuration.id,
        entityId,
        acsUrl,
        profile: {
          issuer: result.profile.issuer,
          nameID: result.profile.nameID,
          nameIDFormat: result.profile.nameIDFormat,
          email: samlUser.email,
          sessionIndex: result.profile.sessionIndex ?? null,
          roles,
          permissions: permissionsForRoles(roles),
          attributes: result.profile.attributes ?? {}
        }
      });
    }

    return Response.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    return Response.json(
      {
        authenticated: false,
        error: "SAML assertion validation failed",
        detail: error instanceof Error ? error.message : "Unknown validation error"
      },
      { status: 401 }
    );
  }
}

function dashboardRedirectForRoles(roles: string[]) {
  const permissions = permissionsForRoles(roles);

  if (permissions.includes("developer:saml")) {
    return "/developer";
  }

  if (permissions.includes("admin:employees")) {
    return "/employees";
  }

  return null;
}
