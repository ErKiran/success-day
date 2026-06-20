"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type SamlConfiguration = {
  id: string;
  name: string;
  idpEntityId: string;
  idpSsoUrl: string;
  idpSloUrl: string | null;
  certificate: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  id?: string;
  name: string;
  idpEntityId: string;
  idpSsoUrl: string;
  idpSloUrl: string;
  certificate: string;
  enabled: boolean;
};

type Errors = Record<string, string[] | undefined>;

const blankForm: FormState = {
  name: "",
  idpEntityId: "",
  idpSsoUrl: "",
  idpSloUrl: "",
  certificate: "",
  enabled: false
};

export default function DeveloperSamlDashboard({ configurations, baseUrl }: { configurations: SamlConfiguration[]; baseUrl: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(blankForm);
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const selectedEndpoints = useMemo(() => (form.id ? samlEndpoints(baseUrl, form.id) : null), [baseUrl, form.id]);

  function update(field: keyof FormState, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function uploadCertificate(file?: File) {
    if (!file) {
      return;
    }

    update("certificate", await file.text());
  }

  function editConfiguration(configuration: SamlConfiguration) {
    setForm({
      id: configuration.id,
      name: configuration.name,
      idpEntityId: configuration.idpEntityId,
      idpSsoUrl: configuration.idpSsoUrl,
      idpSloUrl: configuration.idpSloUrl ?? "",
      certificate: configuration.certificate,
      enabled: configuration.enabled
    });
    setErrors({});
    setMessage("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setErrors({});
    setMessage("");

    const response = await fetch(form.id ? `/api/developer/saml-configs/${form.id}` : "/api/developer/saml-configs", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        idpEntityId: form.idpEntityId,
        idpSsoUrl: form.idpSsoUrl,
        idpSloUrl: form.idpSloUrl,
        certificate: form.certificate,
        enabled: form.enabled
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (response.ok) {
      setForm({
        id: payload.id,
        name: payload.name,
        idpEntityId: payload.idpEntityId,
        idpSsoUrl: payload.idpSsoUrl,
        idpSloUrl: payload.idpSloUrl ?? "",
        certificate: payload.certificate,
        enabled: payload.enabled
      });
      setMessage("SAML configuration saved.");
      router.refresh();
    } else {
      setErrors(payload.errors ?? { form: [payload.error ?? "Unable to save SAML configuration"] });
    }

    setIsSaving(false);
  }

  async function toggleConfiguration(configuration: SamlConfiguration) {
    await fetch(`/api/developer/saml-configs/${configuration.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: !configuration.enabled })
    });
    router.refresh();
  }

  async function deleteConfiguration(configuration: SamlConfiguration) {
    await fetch(`/api/developer/saml-configs/${configuration.id}`, { method: "DELETE" });
    if (form.id === configuration.id) {
      setForm(blankForm);
    }
    router.refresh();
  }

  return (
    <div className="developer-dashboard">
      <section className="developer-sidebar panel">
        <p className="form-eyebrow">Developer RBAC</p>
        <h1>SAML SSO</h1>
        <p className="muted">Configure SAML-based SSO providers. Saved configurations can be enabled, disabled, edited, or deleted.</p>
        <div className="permission-list">
          <span>developer:sso</span>
          <span>developer:saml</span>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>{form.id ? "Edit SAML Configuration" : "Create SAML Configuration"}</h2>
            <p className="muted">Upload the IdP certificate and save the IdP fields to generate SP setup URLs.</p>
          </div>
          <button className="secondary" type="button" onClick={() => setForm(blankForm)}>
            Create New
          </button>
        </div>

        <form className="developer-form" onSubmit={save}>
          <div className="form-grid">
            <Field label="Configuration Name" error={errors.name?.[0]}>
              <input value={form.name} onChange={(event) => update("name", event.target.value)} />
            </Field>
            <Field label="IdP Entity ID" error={errors.idpEntityId?.[0]}>
              <input value={form.idpEntityId} onChange={(event) => update("idpEntityId", event.target.value)} />
            </Field>
            <Field label="IdP SSO URL" error={errors.idpSsoUrl?.[0]}>
              <input type="url" value={form.idpSsoUrl} onChange={(event) => update("idpSsoUrl", event.target.value)} />
            </Field>
            <Field label="IdP SLO URL" error={errors.idpSloUrl?.[0]}>
              <input type="url" value={form.idpSloUrl} onChange={(event) => update("idpSloUrl", event.target.value)} />
            </Field>
          </div>

          <Field label="IdP Signing Certificate" error={errors.certificate?.[0]}>
            <input type="file" accept=".cer,.crt,.pem,.txt" onChange={(event) => uploadCertificate(event.target.files?.[0])} />
            <textarea value={form.certificate} onChange={(event) => update("certificate", event.target.value)} />
          </Field>

          <label className="toggle-row">
            <input type="checkbox" checked={form.enabled} onChange={(event) => update("enabled", event.target.checked)} />
            Enabled
          </label>

          {errors.form?.[0] ? <p className="field-error form-error">{errors.form[0]}</p> : null}
          {message ? <p className="success-message">{message}</p> : null}

          {selectedEndpoints ? (
            <div className="endpoint-box">
              <div>
                <span>Entity ID</span>
                <code>{selectedEndpoints.entityId}</code>
              </div>
              <div>
                <span>ACS URL</span>
                <code>{selectedEndpoints.acsUrl}</code>
              </div>
            </div>
          ) : null}

          <div className="form-actions">
            <button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </section>

      <section className="panel developer-configurations">
        <div className="panel-heading">
          <div>
            <h2>Saved SAML Providers</h2>
            <p className="muted">Use these SP values on the identity provider side.</p>
          </div>
        </div>

        {configurations.length === 0 ? (
          <div className="empty">No SAML configurations yet.</div>
        ) : (
          <div className="configuration-list">
            {configurations.map((configuration) => {
              const endpoints = samlEndpoints(baseUrl, configuration.id);

              return (
                <article className="configuration-card" key={configuration.id}>
                  <div>
                    <div className="configuration-card-heading">
                      <h3>{configuration.name}</h3>
                      <span className={`status-pill ${configuration.enabled ? "active" : "inactive"}`}>{configuration.enabled ? "ENABLED" : "DISABLED"}</span>
                    </div>
                    <p className="muted">{configuration.idpEntityId}</p>
                    <div className="endpoint-box compact">
                      <div>
                        <span>Entity ID</span>
                        <code>{endpoints.entityId}</code>
                      </div>
                      <div>
                        <span>ACS URL</span>
                        <code>{endpoints.acsUrl}</code>
                      </div>
                    </div>
                  </div>
                  <div className="configuration-actions">
                    <button className="secondary" type="button" onClick={() => editConfiguration(configuration)}>
                      Edit
                    </button>
                    <button className="secondary" type="button" onClick={() => toggleConfiguration(configuration)}>
                      {configuration.enabled ? "Disable" : "Enable"}
                    </button>
                    <button className="danger" type="button" onClick={() => deleteConfiguration(configuration)}>
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function samlEndpoints(baseUrl: string, id: string) {
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");

  return {
    entityId: `${cleanBaseUrl}/api/saml/${id}/metadata`,
    acsUrl: `${cleanBaseUrl}/api/saml/${id}/acs`
  };
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label>
      {label}
      {children}
      {error ? <span className="field-error">{error}</span> : null}
    </label>
  );
}
