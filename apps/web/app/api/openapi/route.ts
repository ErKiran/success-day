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
      "/api/developer/saml-configs": {
        get: {
          summary: "List SAML SSO configurations",
          responses: { "200": { description: "SAML SSO configurations" } }
        },
        post: {
          summary: "Create SAML SSO configuration",
          responses: { "201": { description: "SAML SSO configuration created" } }
        }
      },
      "/api/developer/saml-configs/{id}": {
        put: {
          summary: "Update SAML SSO configuration",
          responses: { "200": { description: "SAML SSO configuration updated" } }
        },
        patch: {
          summary: "Enable or disable SAML SSO configuration",
          responses: { "200": { description: "SAML SSO configuration updated" } }
        },
        delete: {
          summary: "Delete SAML SSO configuration",
          responses: { "200": { description: "SAML SSO configuration deleted" } }
        }
      },
      "/api/saml/{id}/metadata": {
        get: { summary: "Get SAML SP metadata", responses: { "200": { description: "SAML metadata XML" } } }
      },
      "/api/saml/login": {
        get: { summary: "Start SAML SSO login with active configuration", responses: { "302": { description: "Redirect to IdP" } } }
      },
      "/api/saml/{id}/acs": {
        post: { summary: "Validate SAML response at assertion consumer service", responses: { "200": { description: "Validated SAML profile" } } }
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
      "/api/scim/v2/Groups": {
        get: { summary: "List SCIM groups", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "200": { description: "SCIM groups" } } },
        post: { summary: "Create SCIM group", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "201": { description: "SCIM group" } } }
      },
      "/api/scim/v2/Groups/{id}": {
        get: { summary: "Get SCIM group", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "200": { description: "SCIM group" } } },
        put: { summary: "Replace SCIM group", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "200": { description: "SCIM group" } } },
        patch: { summary: "Patch SCIM group", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "200": { description: "SCIM group" } } },
        delete: { summary: "Delete SCIM group", security: [{ scimBearer: [] }, { scimBasic: [] }], responses: { "204": { description: "SCIM group deleted" } } }
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
      "/api/scim/v2/Schemas/{id}": {
        get: {
          summary: "Get SCIM schema",
          security: [{ scimBearer: [] }, { scimBasic: [] }],
          responses: { "200": { description: "SCIM schema" } }
        }
      },
      "/api/scim/v2/ResourceTypes": {
        get: {
          summary: "List SCIM resource types",
          security: [{ scimBearer: [] }, { scimBasic: [] }],
          responses: { "200": { description: "SCIM resource types" } }
        }
      },
      "/api/scim/v2/ResourceTypes/{id}": {
        get: {
          summary: "Get SCIM resource type",
          security: [{ scimBearer: [] }, { scimBasic: [] }],
          responses: { "200": { description: "SCIM resource type" } }
        }
      }
    }
  });
}
