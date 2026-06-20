import {
  employeeToScimUser,
  employeesForScimFilter,
  isScimAuthorized,
  scimErrorResponse,
  scimJson,
  scimListResponse,
  scimToEmployeeInput,
  unauthorizedScimResponse
} from "@/lib/scim";
import { employeeCreateSchema, normalizeEmployeeInput } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const url = new URL(request.url);
  const startIndex = Math.max(Number(url.searchParams.get("startIndex") ?? "1"), 1);
  const count = Math.max(Number(url.searchParams.get("count") ?? "20"), 1);
  const employees = await employeesForScimFilter(url.searchParams.get("filter"));
  const page = employees.slice(startIndex - 1, startIndex - 1 + count);
  const resources = page.map((employee) => employeeToScimUser(employee, request));

  return scimJson(scimListResponse(resources, employees.length, startIndex, count));
}

export async function POST(request: Request) {
  if (!isScimAuthorized(request)) {
    return unauthorizedScimResponse();
  }

  const body = await request.json().catch(() => null);
  const parsed = employeeCreateSchema.safeParse(scimToEmployeeInput(body));

  if (!parsed.success) {
    return scimErrorResponse(400, "Invalid SCIM user payload", "invalidValue");
  }

  try {
    const employee = await prisma.employee.create({
      data: normalizeEmployeeInput(parsed.data)
    });

    return scimJson(employeeToScimUser(employee, request), 201);
  } catch {
    return scimErrorResponse(409, "Unique field conflict", "uniqueness");
  }
}
