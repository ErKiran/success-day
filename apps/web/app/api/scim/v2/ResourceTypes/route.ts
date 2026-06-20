import { isScimAuthorized, scimJson, scimListResponse, scimResourceTypes, unauthorizedScimResponse } from "@/lib/scim";

export async function GET(request: Request) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  return scimJson(scimListResponse(scimResourceTypes, scimResourceTypes.length, 1, scimResourceTypes.length));
}
