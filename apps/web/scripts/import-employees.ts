import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { prisma } from "../lib/prisma";
import { employeeCreateSchema, normalizeEmployeeInput } from "../lib/validators";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npm run import:employees -- /app/samples/employees.csv");
  process.exit(1);
}

function parseCsv(content: string) {
  const [headerLine, ...lines] = content.trim().split(/\r?\n/);
  const headers = headerLine.split(",");

  return lines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

const content = readFileSync(filePath, "utf8");
const rows = extname(filePath).toLowerCase() === ".json" ? JSON.parse(content) : parseCsv(content);

let imported = 0;

for (const row of rows) {
  const parsed = employeeCreateSchema.safeParse(row);

  if (!parsed.success) {
    console.error(`Skipping ${row.employeeId ?? "unknown"}: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
    continue;
  }

  await prisma.employee.upsert({
    where: { employeeId: parsed.data.employeeId },
    create: normalizeEmployeeInput(parsed.data),
    update: normalizeEmployeeInput(parsed.data)
  });

  imported += 1;
}

await prisma.$disconnect();
console.log(`Imported ${imported} employees.`);
