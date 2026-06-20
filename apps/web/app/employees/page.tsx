import EmployeeTable from "@/components/EmployeeTable";
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
            <p className="muted">Employees</p>
          </div>
          <div className="actions">
            <Link className="button" href="/employees/new">
              Add Employee
            </Link>
          </div>
        </div>
        <section className="panel">
          <EmployeeTable employees={employees} />
        </section>
      </div>
    </main>
  );
}
