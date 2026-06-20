import { readFileSync } from "node:fs";
import { importEmployees, parseEmployeeImport } from "../lib/import";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Usage: npm run import:employees -- /app/samples/employees.csv");
  process.exit(1);
}

const content = readFileSync(filePath, "utf8");
const rows = parseEmployeeImport(content, filePath);
const { imported, errors } = await importEmployees(rows);

for (const error of errors) {
  console.error(`Skipping ${error}`);
}

console.log(`Imported ${imported} employees.`);
