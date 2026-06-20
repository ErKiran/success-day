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
        <h1>HRIS for Hustler</h1>
        <p className="muted">A clean, modern HR source for IAM and IGA labs.</p>
        <LoginButton />
      </section>
    </main>
  );
}
