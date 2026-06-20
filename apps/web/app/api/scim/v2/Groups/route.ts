import { prisma } from "@/lib/prisma";
import {
  extractScimMemberIds,
  groupsForScimFilter,
  isScimAuthorized,
  scimErrorResponse,
  scimGroupToResource,
  scimListResponse,
  scimJson,
  setScimGroupMembers,
  unauthorizedScimResponse
} from "@/lib/scim";

export async function GET(request: Request) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const url = new URL(request.url);
  const startIndex = Math.max(Number(url.searchParams.get("startIndex") ?? "1"), 1);
  const count = Math.max(Number(url.searchParams.get("count") ?? "20"), 1);
  const groups = await groupsForScimFilter(url.searchParams.get("filter"));
  const page = groups.slice(startIndex - 1, startIndex - 1 + count);
  const resources = page.map((group) => scimGroupToResource(group, request));

  return scimJson(scimListResponse(resources, groups.length, startIndex, count));
}

export async function POST(request: Request) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const body = await request.json().catch(() => null);
  const displayName = String(body?.displayName ?? "").trim();

  if (!displayName) {
    return scimErrorResponse(400, "displayName is required", "invalidValue");
  }

  try {
    const group = await prisma.scimGroup.create({ data: { displayName } });
    await setScimGroupMembers(group.id, extractScimMemberIds(body?.members));

    const created = await prisma.scimGroup.findUniqueOrThrow({
      where: { id: group.id },
      include: { members: { include: { employee: true }, orderBy: { createdAt: "asc" } } }
    });

    return scimJson(scimGroupToResource(created, request), 201);
  } catch {
    return scimErrorResponse(409, "Group displayName already exists", "uniqueness");
  }
}
