import EmployeeForm from "@/components/EmployeeForm";
import { requireSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dateInputValue } from "@/lib/validators";
import { notFound, redirect } from "next/navigation";

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const employee = await prisma.employee.findUnique({ where: { id } });

  if (!employee) {
    notFound();
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="topbar">
          <div>
            <div className="brand">Success Day</div>
            <p className="muted">Edit Employee</p>
          </div>
        </div>
        <section className="panel">
          <EmployeeForm
            employee={{
              id: employee.id,
              employeeId: employee.employeeId,
              firstName: employee.firstName,
              lastName: employee.lastName,
              email: employee.email,
              username: employee.username,
              department: employee.department,
              jobTitle: employee.jobTitle,
              managerEmail: employee.managerEmail ?? "",
              employmentType: employee.employmentType,
              status: employee.status,
              startDate: dateInputValue(employee.startDate),
              location: employee.location ?? ""
            }}
          />
        </section>
      </div>
    </main>
  );
}
