import { prisma } from "@/lib/prisma";
import { employeeUpdateSchema, normalizeEmployeeInput } from "@/lib/validators";
import { applyScimPatch, employeeToScimUser, isScimAuthorized, scimErrorResponse, scimJson, scimToEmployeeInput, unauthorizedScimResponse } from "@/lib/scim";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });

  if (!employee) {
    return scimErrorResponse(404, "User not found");
  }

  return scimJson(employeeToScimUser(employee, request));
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = employeeUpdateSchema.safeParse(scimToEmployeeInput(body));

  if (!parsed.success) {
    return scimErrorResponse(400, "Invalid SCIM user payload", "invalidValue");
  }

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: normalizeEmployeeInput(parsed.data)
    });

    return scimJson(employeeToScimUser(employee, request));
  } catch {
    return scimErrorResponse(409, "User not found or unique field conflict", "uniqueness");
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });

  if (!employee) {
    return scimErrorResponse(404, "User not found");
  }

  const body = await request.json().catch(() => null);
  const updated = await prisma.employee.update({
    where: { id },
    data: applyScimPatch(employee, body)
  });

  return scimJson(employeeToScimUser(updated, request));
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: { status: "TERMINATED" }
    });

    return scimJson(employeeToScimUser(employee, request));
  } catch {
    return scimErrorResponse(404, "User not found");
  }
}
