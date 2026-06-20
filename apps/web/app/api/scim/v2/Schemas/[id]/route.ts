import { isScimAuthorized, scimErrorResponse, scimJson, scimSchemas, unauthorizedScimResponse } from "@/lib/scim";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const schema = scimSchemas.find((item) => item.id === decodeURIComponent(id));

  if (!schema) {
    return scimErrorResponse(404, "Schema not found");
  }

  return scimJson(schema);
}
