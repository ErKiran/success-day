import type { Employee } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const coreUserSchema = "urn:ietf:params:scim:schemas:core:2.0:User";
const enterpriseUserSchema = "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User";
const listResponseSchema = "urn:ietf:params:scim:api:messages:2.0:ListResponse";

export function isScimAuthorized(request: Request) {
  const expected = process.env.SCIM_BEARER_TOKEN ?? "dev-scim-token";
  return request.headers.get("authorization") === `Bearer ${expected}`;
}

export function unauthorizedScimResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function employeeToScimUser(employee: Employee, request: Request) {
  const location = new URL(`/api/scim/v2/Users/${employee.id}`, request.url).toString();

  return {
    schemas: [coreUserSchema, enterpriseUserSchema],
    id: employee.id,
    externalId: employee.employeeId,
    userName: employee.username,
    name: {
      givenName: employee.firstName,
      familyName: employee.lastName
    },
    displayName: `${employee.firstName} ${employee.lastName}`,
    emails: [
      {
        value: employee.email,
        primary: true,
        type: "work"
      }
    ],
    title: employee.jobTitle,
    active: employee.status === "ACTIVE",
    [enterpriseUserSchema]: {
      department: employee.department,
      manager: employee.managerEmail
        ? {
            value: employee.managerEmail,
            displayName: employee.managerEmail
          }
        : undefined
    },
    meta: {
      resourceType: "User",
      location
    }
  };
}

export function scimListResponse(resources: unknown[], totalResults: number, startIndex: number, itemsPerPage: number) {
  return {
    schemas: [listResponseSchema],
    totalResults,
    startIndex,
    itemsPerPage,
    Resources: resources
  };
}

export function scimToEmployeeInput(body: any) {
  const enterprise = body?.[enterpriseUserSchema] ?? {};
  const email = Array.isArray(body?.emails) ? body.emails[0]?.value : undefined;
  const active = body?.active !== false;

  return {
    employeeId: String(body?.externalId ?? body?.userName ?? ""),
    firstName: String(body?.name?.givenName ?? ""),
    lastName: String(body?.name?.familyName ?? ""),
    email: String(email ?? ""),
    username: String(body?.userName ?? ""),
    department: String(enterprise.department ?? ""),
    jobTitle: String(body?.title ?? ""),
    managerEmail: enterprise.manager?.value ? String(enterprise.manager.value) : "",
    employmentType: "FULL_TIME",
    status: active ? "ACTIVE" : "INACTIVE",
    startDate: new Date().toISOString().slice(0, 10),
    location: ""
  };
}

export async function employeesForScimFilter(filter: string | null) {
  if (!filter) {
    return prisma.employee.findMany({ orderBy: [{ lastName: "asc" }, { firstName: "asc" }] });
  }

  const match = filter.match(/^(userName|externalId|emails\.value)\s+eq\s+"([^"]+)"$/);

  if (!match) {
    return [];
  }

  const [, field, value] = match;
  const where =
    field === "userName"
      ? { username: value }
      : field === "externalId"
        ? { employeeId: value }
        : { email: value };

  return prisma.employee.findMany({ where });
}

export function applyScimPatch(employee: Employee, body: any) {
  const data: Record<string, unknown> = {};
  const operations = Array.isArray(body?.Operations) ? body.Operations : [];

  for (const operation of operations) {
    const path = String(operation.path ?? "").toLowerCase();
    const value = operation.value;

    if (path === "active") {
      data.status = value === true ? "ACTIVE" : "INACTIVE";
    }

    if (path === "username" || path === "userName".toLowerCase()) {
      data.username = String(value);
    }

    if (path === "name.givenname") {
      data.firstName = String(value);
    }

    if (path === "name.familyname") {
      data.lastName = String(value);
    }

    if (path === "title") {
      data.jobTitle = String(value);
    }
  }

  return {
    ...data,
    status: data.status ?? employee.status
  };
}
