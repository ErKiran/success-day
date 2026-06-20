import { hasPermission, requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await requireSession();

  if (!session) {
    redirect("/login");
  }

  if (hasPermission(session, "developer:saml")) {
    redirect("/developer");
  }

  if (hasPermission(session, "admin:employees")) {
    redirect("/employees");
  }

  redirect("/login");
}
