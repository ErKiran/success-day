import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeSamlSsoConfigurationInput, samlSsoConfigurationSchema } from "@/lib/validators";

export async function GET() {
  const session = await requirePermission("developer:saml");

  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const configurations = await prisma.samlSsoConfiguration.findMany({
    orderBy: [{ enabled: "desc" }, { updatedAt: "desc" }]
  });

  return Response.json(configurations);
}

export async function POST(request: Request) {
  const session = await requirePermission("developer:saml");

  if (!session) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = samlSsoConfigurationSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const configuration = await prisma.samlSsoConfiguration.create({
    data: {
      ...normalizeSamlSsoConfigurationInput(parsed.data),
      createdBy: session.user?.email ?? session.user?.name ?? null
    }
  });

  return Response.json(configuration, { status: 201 });
}
