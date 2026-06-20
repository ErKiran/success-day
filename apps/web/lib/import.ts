import { prisma } from "./prisma";
import { employeeCreateSchema, normalizeEmployeeInput } from "./validators";

export function parseCsv(content: string) {
  const [headerLine, ...lines] = content.trim().split(/\r?\n/);
  const headers = splitCsvLine(headerLine);

  return lines.filter(Boolean).map((line) => {
    const values = splitCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

export function parseEmployeeImport(content: string, fileName: string) {
  if (fileName.toLowerCase().endsWith(".json")) {
    return JSON.parse(content);
  }

  return parseCsv(content);
}

export async function importEmployees(rows: unknown[]) {
  let imported = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const parsed = employeeCreateSchema.safeParse(row);

    if (!parsed.success) {
      const label = typeof row === "object" && row && "employeeId" in row ? String(row.employeeId) : "unknown";
      errors.push(`${label}: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
      continue;
    }

    await prisma.employee.upsert({
      where: { employeeId: parsed.data.employeeId },
      create: normalizeEmployeeInput(parsed.data),
      update: normalizeEmployeeInput(parsed.data)
    });

    imported += 1;
  }

  return { imported, errors };
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      values.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  values.push(current);
  return values.map((value) => value.trim());
}
