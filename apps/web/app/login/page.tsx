import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginButton from "./login-button";

export default async function LoginPage() {
  const session = await getAuthSession();

  if (session) {
    redirect("/employees");
  }

  return (
    <main className="login">
      <section className="panel">
        <p className="brand">Success Day</p>
        <p className="muted">Minimal HR source application for IAM and IGA labs.</p>
        <LoginButton />
      </section>
    </main>
  );
}
