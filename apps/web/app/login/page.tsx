import { requireSession } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import LoginButton from "./login-button";

export default async function LoginPage() {
  const session = await requireSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="login-shell hero-login-shell">
      <section className="hero-login">
        <header className="hero-nav">
          <div>
            <p className="hero-brand">Success Day</p>
            <p className="hero-tagline">HRIS for Hustler</p>
          </div>

          <nav className="hero-nav-actions" aria-label="Primary">
            <Link className="button secondary hero-nav-link" href="/api-docs">
              Docs
            </Link>
            <Link className="button secondary hero-nav-link" href="/api/saml/login">
              SAML SSO
            </Link>
            <LoginButton />
          </nav>
        </header>

        <img
          className="hero-login-image"
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=80"
          alt="Employees working around an office table"
        />

        <div className="hero-login-overlay" />

        <div className="hero-login-content panel">
          <h1>HRIS for Hustler</h1>
          <p className="muted">HRIS system for hustler. SSO, SCIM and RBAC supported Out of the Box </p>
          <div className="hero-login-actions">
            <LoginButton />
            <Link className="button secondary" href="/api/saml/login">
              SAML SSO
            </Link>
            <Link className="button secondary" href="/api-docs">
              Docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
