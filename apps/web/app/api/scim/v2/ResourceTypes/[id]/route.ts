import { isScimAuthorized, scimErrorResponse, scimJson, scimResourceTypes, unauthorizedScimResponse } from "@/lib/scim";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const resourceType = scimResourceTypes.find((item) => item.id.toLowerCase() === decodeURIComponent(id).toLowerCase());

  if (!resourceType) {
    return scimErrorResponse(404, "Resource type not found");
  }

  return scimJson(resourceType);
}
