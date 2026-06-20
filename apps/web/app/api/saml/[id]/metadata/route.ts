import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

function escapeXml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const configuration = await prisma.samlSsoConfiguration.findUnique({ where: { id } });

  if (!configuration || !configuration.enabled) {
    return new Response("SAML configuration not found", { status: 404 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? new URL(request.url).origin;
  const entityId = `${baseUrl.replace(/\/$/, "")}/api/saml/${configuration.id}/metadata`;
  const acsUrl = `${baseUrl.replace(/\/$/, "")}/api/saml/${configuration.id}/acs`;
  const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${escapeXml(entityId)}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${escapeXml(acsUrl)}" index="1" isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;

  return new Response(metadata, {
    headers: {
      "Content-Type": "application/samlmetadata+xml"
    }
  });
}
