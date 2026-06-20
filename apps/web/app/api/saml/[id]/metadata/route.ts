import { prisma } from "@/lib/prisma";
import { createSamlServiceProvider } from "@/lib/saml";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const configuration = await prisma.samlSsoConfiguration.findUnique({ where: { id } });

  if (!configuration || !configuration.enabled) {
    return new Response("SAML configuration not found", { status: 404 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  const metadata = createSamlServiceProvider(configuration, baseUrl).generateServiceProviderMetadata(null, null);

  return new Response(metadata, {
    headers: {
      "Content-Type": "application/samlmetadata+xml"
    }
  });
}
