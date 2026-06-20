import ApiExplorer from "./api-explorer";

export default function ApiDocsPage() {
  return (
    <main className="page api-docs-page">
      <div className="shell api-docs-shell">
        <div className="topbar api-docs-topbar">
          <div>
            <div className="brand">Success Day</div>
            <p className="slogan">HRIS for Hustler</p>
          </div>
          <div className="actions">
            <a className="button secondary" href="/api/openapi">
              OpenAPI JSON
            </a>
            <a className="button secondary" href="/api/postman">
              Postman
            </a>
          </div>
        </div>

        <section className="panel api-docs-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">API Docs</p>
              <h1>API Explorer</h1>
              <p className="muted">Interactive docs for employees and SCIM endpoints, with OpenAPI and Postman exports.</p>
            </div>
          </div>
          <ApiExplorer />
        </section>
      </div>
    </main>
  );
}
