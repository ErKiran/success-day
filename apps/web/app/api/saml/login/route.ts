import { prisma } from "@/lib/prisma";
import { createSamlServiceProvider } from "@/lib/saml";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const configuration = await prisma.samlSsoConfiguration.findFirst({
    where: { enabled: true },
    orderBy: { updatedAt: "desc" }
  });

  if (!configuration) {
    return Response.redirect(new URL("/login?error=saml_not_configured", request.url));
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  const saml = createSamlServiceProvider(configuration, baseUrl);
  const loginUrl = await saml.getAuthorizeUrlAsync("", undefined, {});

  return Response.redirect(loginUrl);
}
