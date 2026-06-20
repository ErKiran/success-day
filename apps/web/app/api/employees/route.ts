import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { employeeCreateSchema, normalizeEmployeeInput } from "@/lib/validators";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requirePermission("admin:employees");

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const employees = await prisma.employee.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
  });

  return NextResponse.json(employees);
}

export async function POST(request: Request) {
  const session = await requirePermission("admin:employees");

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = employeeCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  try {
    const employee = await prisma.employee.create({
      data: normalizeEmployeeInput(parsed.data)
    });

    return NextResponse.json(employee, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Employee ID, email, and username must be unique" }, { status: 409 });
  }
}
