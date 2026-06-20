import { isScimAuthorized, scimJson, scimListResponse, scimSchemas, unauthorizedScimResponse } from "@/lib/scim";

export async function GET(request: Request) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  return scimJson(scimListResponse(scimSchemas, scimSchemas.length, 1, scimSchemas.length));
}
