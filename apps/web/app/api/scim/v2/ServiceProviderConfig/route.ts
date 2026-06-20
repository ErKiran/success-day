import { isScimAuthorized, unauthorizedScimResponse } from "@/lib/scim";

export async function GET(request: Request) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  return Response.json({
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:ServiceProviderConfig"],
    patch: { supported: true },
    bulk: { supported: false },
    filter: { supported: true, maxResults: 100 },
    changePassword: { supported: false },
    sort: { supported: false },
    etag: { supported: false },
    authenticationSchemes: [
      {
        type: "oauthbearertoken",
        name: "Bearer Token",
        description: "Static bearer token",
        primary: true
      },
      {
        type: "httpbasic",
        name: "Basic Auth",
        description: "Static SCIM username and password",
        primary: false
      }
    ]
  });
}
