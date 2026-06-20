import { requirePermission } from "@/lib/auth";
import { parseEmployeeImport, importEmployees } from "@/lib/import";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await requirePermission("admin:employees");

  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a CSV or JSON file." }, { status: 400 });
  }

  const content = await file.text();
  const rows = parseEmployeeImport(content, file.name);

  if (!Array.isArray(rows)) {
    return NextResponse.json({ error: "Import file must contain employee rows." }, { status: 400 });
  }

  const result = await importEmployees(rows);

  if (result.imported === 0 && result.errors.length > 0) {
    return NextResponse.json({ error: "No employees imported.", errors: result.errors }, { status: 400 });
  }

  return NextResponse.json(result);
}
