import SwaggerDocs from "./swagger-docs";

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
              <h1>Swagger UI</h1>
              <p className="muted">Interactive OpenAPI documentation for employees and SCIM endpoints.</p>
            </div>
          </div>
          <SwaggerDocs />
        </section>
      </div>
    </main>
  );
}