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
            <p className="slogan">HRIS for Hustler</p>
          </div>
        </div>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h1>Edit Employee</h1>
              <p className="muted">Update source-of-truth attributes for identity flows.</p>
            </div>
          </div>
          <EmployeeForm
            employee={{
              id: employee.id,
              employeeId: employee.employeeId,
              firstName: employee.firstName,
              lastName: employee.lastName,
              email: employee.email,
              username: employee.username,
              phoneNumber: employee.phoneNumber ?? "",
              department: employee.department,
              jobTitle: employee.jobTitle,
              managerEmail: employee.managerEmail ?? "",
              employmentType: employee.employmentType,
              contractDuration: employee.contractDuration ?? "",
              status: employee.status,
              startDate: dateInputValue(employee.startDate),
              location: employee.location ?? "",
              country: employee.country ?? "",
              state: employee.state ?? "",
              streetAddress: employee.streetAddress ?? ""
            }}
          />
        </section>
      </div>
    </main>
  );
}
