import { isScimAuthorized, unauthorizedScimResponse } from "@/lib/scim";

export async function GET(request: Request) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  return Response.json({
    schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
    totalResults: 2,
    startIndex: 1,
    itemsPerPage: 2,
    Resources: [
      {
        id: "urn:ietf:params:scim:schemas:core:2.0:User",
        name: "User"
      },
      {
        id: "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User",
        name: "EnterpriseUser"
      }
    ]
  });
}
