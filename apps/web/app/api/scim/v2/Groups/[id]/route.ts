import { prisma } from "@/lib/prisma";
import {
  applyScimGroupPatch,
  extractScimMemberIds,
  isScimAuthorized,
  scimErrorResponse,
  scimGroupToResource,
  scimJson,
  setScimGroupMembers,
  unauthorizedScimResponse
} from "@/lib/scim";

type RouteContext = { params: Promise<{ id: string }> };

const groupInclude = { members: { include: { employee: true }, orderBy: { createdAt: "asc" as const } } };

export async function GET(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const group = await prisma.scimGroup.findUnique({ where: { id }, include: groupInclude });

  if (!group) {
    return scimErrorResponse(404, "Group not found");
  }

  return scimJson(scimGroupToResource(group, request));
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const displayName = String(body?.displayName ?? "").trim();

  if (!displayName) {
    return scimErrorResponse(400, "displayName is required", "invalidValue");
  }

  try {
    await prisma.scimGroup.update({ where: { id }, data: { displayName } });
    await setScimGroupMembers(id, extractScimMemberIds(body?.members));

    const group = await prisma.scimGroup.findUniqueOrThrow({ where: { id }, include: groupInclude });
    return scimJson(scimGroupToResource(group, request));
  } catch {
    return scimErrorResponse(409, "Group not found or displayName already exists", "uniqueness");
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const group = await prisma.scimGroup.findUnique({ where: { id } });

  if (!group) {
    return scimErrorResponse(404, "Group not found");
  }

  const body = await request.json().catch(() => null);

  try {
    await applyScimGroupPatch(group, body);
    const updated = await prisma.scimGroup.findUniqueOrThrow({ where: { id }, include: groupInclude });
    return scimJson(scimGroupToResource(updated, request));
  } catch {
    return scimErrorResponse(400, "Invalid group patch operation", "invalidSyntax");
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;

  try {
    await prisma.scimGroup.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return scimErrorResponse(404, "Group not found");
  }
}
