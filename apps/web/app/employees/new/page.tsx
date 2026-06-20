import EmployeeForm from "@/components/EmployeeForm";
import { requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NewEmployeePage() {
  const session = await requireSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="topbar">
          <div>
            <div className="brand">Success Day</div>
            <p className="muted">Add Employee</p>
          </div>
        </div>
        <section className="panel">
          <EmployeeForm />
        </section>
      </div>
    </main>
  );
}
