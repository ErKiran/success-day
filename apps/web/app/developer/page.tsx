import DeveloperSamlDashboard from "@/components/DeveloperSamlDashboard";
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
        <div className="topbar">
          <div>
            <div className="brand">Success Day Developer</div>
            <p className="slogan">SSO configuration workspace</p>
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
