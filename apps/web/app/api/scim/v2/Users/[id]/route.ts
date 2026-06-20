import { prisma } from "@/lib/prisma";
import { employeeUpdateSchema, normalizeEmployeeInput } from "@/lib/validators";
import { applyScimPatch, employeeToScimUser, isScimAuthorized, scimToEmployeeInput, unauthorizedScimResponse } from "@/lib/scim";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });

  if (!employee) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json(employeeToScimUser(employee, request));
}

export async function PUT(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = employeeUpdateSchema.safeParse(scimToEmployeeInput(body));

  if (!parsed.success) {
    return Response.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: normalizeEmployeeInput(parsed.data)
    });

    return Response.json(employeeToScimUser(employee, request));
  } catch {
    return Response.json({ error: "User not found or unique field conflict" }, { status: 409 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });

  if (!employee) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const updated = await prisma.employee.update({
    where: { id },
    data: applyScimPatch(employee, body)
  });

  return Response.json(employeeToScimUser(updated, request));
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

    return Response.json(employeeToScimUser(employee, request));
  } catch {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
}
