import ApiExplorer from "./api-explorer";

export default function ApiDocsPage() {
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
              <h1>API Docs</h1>
              <p className="muted">OpenAPI-backed docs with quick calls for employee and SCIM endpoints.</p>
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
          <ApiExplorer />
        </section>
      </div>
    </main>
  );
}
