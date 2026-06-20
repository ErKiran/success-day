import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSamlSsoConfigurationInput, samlSsoConfigurationSchema } from "@/lib/validators";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await requirePermission("developer:saml");

  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = samlSsoConfigurationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const configuration = await prisma.samlSsoConfiguration.update({
      where: { id },
      data: normalizeSamlSsoConfigurationInput(parsed.data)
    });

    return Response.json(configuration);
  } catch {
    return Response.json({ error: "SAML configuration not found" }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await requirePermission("developer:saml");

  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (typeof body?.enabled !== "boolean") {
    return Response.json({ error: "enabled must be true or false" }, { status: 400 });
  }

  try {
    const configuration = await prisma.samlSsoConfiguration.update({
      where: { id },
      data: { enabled: body.enabled }
    });

    return Response.json(configuration);
  } catch {
    return Response.json({ error: "SAML configuration not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await requirePermission("developer:saml");

  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    await prisma.samlSsoConfiguration.delete({ where: { id } });
    return Response.json({ deleted: true });
  } catch {
    return Response.json({ error: "SAML configuration not found" }, { status: 404 });
  }
}
