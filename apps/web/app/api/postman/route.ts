export async function GET() {
  return Response.json({
    info: {
      name: "Success Day API",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    variable: [
      { key: "baseUrl", value: "http://localhost:3000" },
      { key: "scimBearerToken", value: "dev-scim-token" }
    ],
    item: [
      {
        name: "List Employees",
        request: {
          method: "GET",
          url: "{{baseUrl}}/api/employees"
        }
      },
      {
        name: "Create Employee",
        request: {
          method: "POST",
          header: [{ key: "Content-Type", value: "application/json" }],
          url: "{{baseUrl}}/api/employees",
          body: {
            mode: "raw",
            raw: JSON.stringify(
              {
                employeeId: "E1004",
                firstName: "Jordan",
                lastName: "Taylor",
                email: "jordan.taylor@example.com",
                username: "jordan.taylor",
                phoneNumber: "+1 555 0104",
                department: "Security",
                jobTitle: "Security Engineer",
                managerEmail: "manager@example.com",
                employmentType: "FULL_TIME",
                contractDuration: "",
                status: "ACTIVE",
                startDate: "2026-02-15",
                location: "Remote",
                country: "United States",
                state: "Illinois",
                streetAddress: ""
              },
              null,
              2
            )
          }
        }
      },
      {
        name: "List SCIM Users",
        request: {
          method: "GET",
          header: [{ key: "Authorization", value: "Bearer {{scimBearerToken}}" }],
          url: "{{baseUrl}}/api/scim/v2/Users"
        }
      },
      {
        name: "SCIM Service Provider Config",
        request: {
          method: "GET",
          header: [{ key: "Authorization", value: "Bearer {{scimBearerToken}}" }],
          url: "{{baseUrl}}/api/scim/v2/ServiceProviderConfig"
        }
      }
    ]
  });
}
