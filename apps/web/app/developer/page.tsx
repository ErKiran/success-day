import DeveloperSamlDashboard from "@/components/DeveloperSamlDashboard";
import LogoutButton from "@/components/LogoutButton";
import { requirePermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DeveloperPage() {
  const session = await requirePermission("developer:saml");

  if (!session) {
    redirect("/login");
  }

  const configurations = await prisma.samlSsoConfiguration.findMany({
    orderBy: [{ enabled: "desc" }, { updatedAt: "desc" }]
  });

  return (
    <main className="page">
      <div className="shell">
        <div className="topbar topbar-actions-only">
          <div />
          <div className="actions">
            <LogoutButton />
          </div>
        </div>
        <DeveloperSamlDashboard
          baseUrl={process.env.NEXTAUTH_URL ?? "http://localhost:3000"}
          configurations={configurations.map((configuration) => ({
            ...configuration,
            createdAt: configuration.createdAt.toISOString(),
            updatedAt: configuration.updatedAt.toISOString()
          }))}
        />
      </div>
    </main>
  );
}
