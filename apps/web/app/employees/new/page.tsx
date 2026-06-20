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
            <p className="slogan">HRIS for Hustler</p>
          </div>
        </div>
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h1>Add Employee</h1>
              <p className="muted">Capture the core identity and workforce attributes.</p>
            </div>
          </div>
          <EmployeeForm />
        </section>
      </div>
    </main>
  );
}
