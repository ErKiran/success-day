import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const configuration = await prisma.samlSsoConfiguration.findUnique({ where: { id } });

  if (!configuration || !configuration.enabled) {
    return Response.json({ error: "SAML configuration not found" }, { status: 404 });
  }

  return Response.json({
    received: true,
    message: "SAML ACS endpoint is configured. Assertion validation is not enabled in this lab build."
  });
}
