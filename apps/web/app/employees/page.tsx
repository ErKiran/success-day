import EmployeeTable from "@/components/EmployeeTable";
import ImportEmployees from "@/components/ImportEmployees";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function EmployeesPage() {
  const session = await requireSession();

  if (!session) {
    redirect("/login");
  }

  const employees = await prisma.employee.findMany({
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }]
  });

  return (
    <main className="page">
      <div className="shell">
        <div className="topbar">
          <div>
            <div className="brand">Success Day</div>
            <p className="slogan">HRIS for Hustler</p>
          </div>
          <div className="actions">
            <Link className="button secondary" href="/api-docs">
              API Docs
            </Link>
            <Link className="button" href="/employees/new">
              Add Employee
            </Link>
          </div>
        </div>
        <section className="metrics">
          <div>
            <span>Total Employees</span>
            <strong>{employees.length}</strong>
          </div>
          <div>
            <span>Active</span>
            <strong>{employees.filter((employee) => employee.status === "ACTIVE").length}</strong>
          </div>
          <div>
            <span>Departments</span>
            <strong>{new Set(employees.map((employee) => employee.department)).size}</strong>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h1>People Directory</h1>
              <p className="muted">Create, import, and prepare identities for downstream IAM systems.</p>
            </div>
            <ImportEmployees />
          </div>
          <EmployeeTable employees={employees} />
        </section>
      </div>
    </main>
  );
}
