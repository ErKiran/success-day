export async function GET() {
  return Response.json({
    openapi: "3.0.3",
    info: {
      title: "Success Day API",
      version: "0.2.0",
      description: "HRIS for Hustler"
    },
    servers: [{ url: "http://localhost:3000" }],
    components: {
      securitySchemes: {
        scimBearer: { type: "http", scheme: "bearer" },
        scimBasic: { type: "http", scheme: "basic" }
      }
    },
    paths: {
      "/api/employees": {
        get: { summary: "List employees", responses: { "200": { description: "Employees" } } },
        post: { summary: "Create employee", responses: { "201": { description: "Employee created" } } }
      },
      "/api/employees/{id}": {
        get: { summary: "Get employee", responses: { "200": { description: "Employee" } } },
        put: { summary: "Update employee", responses: { "200": { description: "Employee updated" } } },
        delete: { summary: "Terminate employee", responses: { "200": { description: "Employee terminated" } } }
      },
      "/api/employees/import": {
        post: { summary: "Import employees from CSV or JSON", responses: { "200": { description: "Import result" } } }
      },
      "/api/openapi": {
        get: { summary: "Get OpenAPI document", responses: { "200": { description: "OpenAPI JSON" } } }
      },
      "/api/postman": {
        get: { summary: "Get Postman collection", responses: { "200": { description: "Postman collection JSON" } } }
      },
      "/api/scim/v2/Users": {
        get: { summary: "List SCIM users", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "200": { description: "SCIM users" } } },
        post: { summary: "Create SCIM user", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "201": { description: "SCIM user" } } }
      },
      "/api/scim/v2/Users/{id}": {
        get: { summary: "Get SCIM user", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "200": { description: "SCIM user" } } },
        put: { summary: "Replace SCIM user", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "200": { description: "SCIM user" } } },
        patch: { summary: "Patch SCIM user", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "200": { description: "SCIM user" } } },
        delete: { summary: "Terminate SCIM user", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "200": { description: "SCIM user" } } }
      },
      "/api/scim/v2/ServiceProviderConfig": {
        get: {
          summary: "Get SCIM service provider config",
          security: [{ scimBearer: [] }, { scimBasic: [] }],
          responses: { "200": { description: "SCIM service provider config" } }
        }
      },
      "/api/scim/v2/Schemas": {
        get: {
          summary: "List SCIM schemas",
          security: [{ scimBearer: [] }, { scimBasic: [] }],
          responses: { "200": { description: "SCIM schemas" } }
        }
      },
      "/api/scim/v2/ResourceTypes": {
        get: {
          summary: "List SCIM resource types",
          security: [{ scimBearer: [] }, { scimBasic: [] }],
          responses: { "200": { description: "SCIM resource types" } }
        }
      }
    }
  });
}
