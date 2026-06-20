import type { Employee, ScimGroup, ScimGroupMember } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const coreUserSchema = "urn:ietf:params:scim:schemas:core:2.0:User";
export const coreGroupSchema = "urn:ietf:params:scim:schemas:core:2.0:Group";
export const enterpriseUserSchema = "urn:ietf:params:scim:schemas:extension:enterprise:2.0:User";
export const listResponseSchema = "urn:ietf:params:scim:api:messages:2.0:ListResponse";
export const errorSchema = "urn:ietf:params:scim:api:messages:2.0:Error";

type ScimGroupWithMembers = ScimGroup & {
  members: Array<ScimGroupMember & { employee: Employee }>;
};

export function isScimAuthorized(request: Request) {
  const authorization = request.headers.get("authorization") ?? "";
  const expectedBearer = process.env.SCIM_BEARER_TOKEN ?? "dev-scim-token";
  const expectedUser = process.env.SCIM_BASIC_USERNAME ?? "scim";
  const expectedPassword = process.env.SCIM_BASIC_PASSWORD ?? "scim-secret";
  const expectedBasic = `Basic ${Buffer.from(`${expectedUser}:${expectedPassword}`).toString("base64")}`;

  return authorization === `Bearer ${expectedBearer}` || authorization === expectedBasic;
}

export function unauthorizedScimResponse() {
  return scimErrorResponse(401, "Unauthorized");
}

export function scimJson(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/scim+json" }
  });
}

export function scimErrorResponse(status: number, detail: string, scimType?: string) {
  return scimJson(
    {
      schemas: [errorSchema],
      status: String(status),
      ...(scimType ? { scimType } : {}),
      detail
    },
    status
  );
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
    phoneNumbers: employee.phoneNumber
      ? [
          {
            value: employee.phoneNumber,
            type: "work",
            primary: true
          }
        ]
      : [],
    title: employee.jobTitle,
    active: employee.status === "ACTIVE",
    [enterpriseUserSchema]: {
      department: employee.department,
      costCenter: employee.contractDuration ?? undefined,
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

export function scimGroupToResource(group: ScimGroupWithMembers, request: Request) {
  const location = new URL(`/api/scim/v2/Groups/${group.id}`, request.url).toString();

  return {
    schemas: [coreGroupSchema],
    id: group.id,
    displayName: group.displayName,
    members: group.members.map(({ employee }) => ({
      value: employee.id,
      display: `${employee.firstName} ${employee.lastName}`,
      $ref: new URL(`/api/scim/v2/Users/${employee.id}`, request.url).toString()
    })),
    meta: {
      resourceType: "Group",
      created: group.createdAt.toISOString(),
      lastModified: group.updatedAt.toISOString(),
      location
    }
  };
}

export function scimToEmployeeInput(body: any) {
  const enterprise = body?.[enterpriseUserSchema] ?? {};
  const email = Array.isArray(body?.emails) ? body.emails[0]?.value : undefined;
  const phoneNumber = Array.isArray(body?.phoneNumbers) ? body.phoneNumbers[0]?.value : undefined;
  const active = body?.active !== false;

  return {
    employeeId: String(body?.externalId ?? body?.userName ?? ""),
    firstName: String(body?.name?.givenName ?? ""),
    lastName: String(body?.name?.familyName ?? ""),
    email: String(email ?? ""),
    username: String(body?.userName ?? ""),
    phoneNumber: String(phoneNumber ?? ""),
    department: String(enterprise.department ?? ""),
    jobTitle: String(body?.title ?? ""),
    managerEmail: enterprise.manager?.value ? String(enterprise.manager.value) : "",
    employmentType: "FULL_TIME",
    contractDuration: enterprise.costCenter ? String(enterprise.costCenter) : "",
    status: active ? "ACTIVE" : "INACTIVE",
    startDate: new Date().toISOString().slice(0, 10),
    location: "",
    country: "",
    state: "",
    streetAddress: ""
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

export async function groupsForScimFilter(filter: string | null) {
  const include = { members: { include: { employee: true }, orderBy: { createdAt: "asc" as const } } };

  if (!filter) {
    return prisma.scimGroup.findMany({ include, orderBy: { displayName: "asc" } });
  }

  const match = filter.match(/^displayName\s+eq\s+"([^"]+)"$/i);

  if (!match) {
    return [];
  }

  return prisma.scimGroup.findMany({ where: { displayName: match[1] }, include });
}

export function extractScimMemberIds(value: unknown) {
  if (!value) {
    return [];
  }

  const members: unknown[] = Array.isArray(value) ? value : Array.isArray((value as any).members) ? (value as any).members : [value];
  return members.map((member: unknown) => String((member as any)?.value ?? member)).filter(Boolean);
}

export async function setScimGroupMembers(groupId: string, memberIds: string[]) {
  const uniqueMemberIds = Array.from(new Set(memberIds));
  const existingEmployees = await prisma.employee.findMany({
    where: { id: { in: uniqueMemberIds } },
    select: { id: true }
  });
  const validMemberIds = new Set(existingEmployees.map((employee) => employee.id));

  await prisma.scimGroupMember.deleteMany({ where: { groupId } });

  if (validMemberIds.size === 0) {
    return;
  }

  await prisma.scimGroupMember.createMany({
    data: Array.from(validMemberIds).map((employeeId) => ({ groupId, employeeId }))
  });
}

export async function addScimGroupMembers(groupId: string, memberIds: string[]) {
  const uniqueMemberIds = Array.from(new Set(memberIds));
  const existingEmployees = await prisma.employee.findMany({
    where: { id: { in: uniqueMemberIds } },
    select: { id: true }
  });

  if (existingEmployees.length === 0) {
    return;
  }

  const existingMemberships = await prisma.scimGroupMember.findMany({
    where: { groupId, employeeId: { in: existingEmployees.map((employee) => employee.id) } },
    select: { employeeId: true }
  });
  const existingMemberIds = new Set(existingMemberships.map((membership) => membership.employeeId));
  const membershipsToCreate = existingEmployees
    .filter((employee) => !existingMemberIds.has(employee.id))
    .map((employee) => ({ groupId, employeeId: employee.id }));

  if (membershipsToCreate.length === 0) {
    return;
  }

  await prisma.scimGroupMember.createMany({
    data: membershipsToCreate
  });
}

export async function removeScimGroupMembers(groupId: string, memberIds: string[]) {
  await prisma.scimGroupMember.deleteMany({
    where: { groupId, employeeId: { in: Array.from(new Set(memberIds)) } }
  });
}

export async function applyScimGroupPatch(group: ScimGroup, body: any) {
  const operations = Array.isArray(body?.Operations) ? body.Operations : [];

  for (const operation of operations) {
    const op = String(operation.op ?? "replace").toLowerCase();
    const path = String(operation.path ?? "").toLowerCase();
    const value = operation.value;

    if (path === "displayname" || (!path && value?.displayName)) {
      await prisma.scimGroup.update({
        where: { id: group.id },
        data: { displayName: String(value?.displayName ?? value) }
      });
    }

    if (path === "members" || (!path && value?.members)) {
      const memberIds = extractScimMemberIds(value?.members ?? value);

      if (op === "remove") {
        await removeScimGroupMembers(group.id, memberIds);
      } else if (op === "add") {
        await addScimGroupMembers(group.id, memberIds);
      } else {
        await setScimGroupMembers(group.id, memberIds);
      }
    }
  }
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

    if (path === "phonenumbers" || path === "phonenumbers.value") {
      data.phoneNumber = typeof value === "string" ? value : value?.value ? String(value.value) : null;
    }
  }

  return {
    ...data,
    status: data.status ?? employee.status
  };
}

export const scimSchemas = [
  {
    id: coreUserSchema,
    name: "User",
    description: "User Account",
    attributes: [
      { name: "userName", type: "string", multiValued: false, required: true, mutability: "readWrite", returned: "default", uniqueness: "server" },
      { name: "name", type: "complex", multiValued: false, required: false, mutability: "readWrite", returned: "default", uniqueness: "none" },
      { name: "displayName", type: "string", multiValued: false, required: false, mutability: "readWrite", returned: "default", uniqueness: "none" },
      { name: "emails", type: "complex", multiValued: true, required: true, mutability: "readWrite", returned: "default", uniqueness: "none" },
      { name: "active", type: "boolean", multiValued: false, required: false, mutability: "readWrite", returned: "default", uniqueness: "none" },
      { name: "title", type: "string", multiValued: false, required: false, mutability: "readWrite", returned: "default", uniqueness: "none" }
    ]
  },
  {
    id: enterpriseUserSchema,
    name: "EnterpriseUser",
    description: "Enterprise User",
    attributes: [
      { name: "department", type: "string", multiValued: false, required: false, mutability: "readWrite", returned: "default", uniqueness: "none" },
      { name: "costCenter", type: "string", multiValued: false, required: false, mutability: "readWrite", returned: "default", uniqueness: "none" },
      { name: "manager", type: "complex", multiValued: false, required: false, mutability: "readWrite", returned: "default", uniqueness: "none" }
    ]
  },
  {
    id: coreGroupSchema,
    name: "Group",
    description: "Group",
    attributes: [
      { name: "displayName", type: "string", multiValued: false, required: true, mutability: "readWrite", returned: "default", uniqueness: "server" },
      { name: "members", type: "complex", multiValued: true, required: false, mutability: "readWrite", returned: "default", uniqueness: "none" }
    ]
  }
];

export const scimResourceTypes = [
  {
    id: "User",
    name: "User",
    endpoint: "/Users",
    schema: coreUserSchema,
    schemaExtensions: [{ schema: enterpriseUserSchema, required: false }]
  },
  {
    id: "Group",
    name: "Group",
    endpoint: "/Groups",
    schema: coreGroupSchema,
    schemaExtensions: []
  }
];
