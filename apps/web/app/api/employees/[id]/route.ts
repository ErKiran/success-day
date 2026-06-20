import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { employeeUpdateSchema, normalizeEmployeeInput } from "@/lib/validators";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await requirePermission("admin:employees");

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });

  if (!employee) {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }

  return NextResponse.json(employee);
}

export async function PUT(request: Request, { params }: RouteContext) {
  const session = await requirePermission("admin:employees");

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = employeeUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: normalizeEmployeeInput(parsed.data)
    });

    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "Employee not found or unique field conflict" }, { status: 409 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await requirePermission("admin:employees");

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data: { status: "TERMINATED" }
    });

    return NextResponse.json(employee);
  } catch {
    return NextResponse.json({ error: "Employee not found" }, { status: 404 });
  }
}
