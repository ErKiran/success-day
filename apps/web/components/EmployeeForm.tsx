"use client";

import { departmentValues, employmentTypeValues, statusValues } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormEmployee = {
  id?: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  department: string;
  jobTitle: string;
  managerEmail: string;
  employmentType: string;
  contractDuration: string;
  status: string;
  startDate: string;
  location: string;
  country: string;
  state: string;
  streetAddress: string;
};

type Errors = Record<string, string[] | undefined>;

const steps = [
  {
    title: "Identity",
    description: "Core profile and login details"
  },
  {
    title: "Work",
    description: "Role, status, and employment setup"
  },
  {
    title: "Location",
    description: "Office and address information"
  }
] as const;

const blankEmployee: FormEmployee = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  phoneNumber: "",
  department: "",
  jobTitle: "",
  managerEmail: "",
  employmentType: "FULL_TIME",
  contractDuration: "",
  status: "ACTIVE",
  startDate: "",
  location: "",
  country: "",
  state: "",
  streetAddress: ""
};

export default function EmployeeForm({ employee }: { employee?: FormEmployee }) {
  const router = useRouter();
  const [form, setForm] = useState<FormEmployee>(employee ?? blankEmployee);
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const isEditing = Boolean(employee?.id);

  const currentStep = steps[activeStep];
  const completion = ((activeStep + 1) / steps.length) * 100;

  function update(field: keyof FormEmployee, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeStep < steps.length - 1) {
      setActiveStep((current) => current + 1);
      return;
    }

    setIsSaving(true);
    setErrors({});

    const url = isEditing ? `/api/employees/${employee?.id}` : "/api/employees";
    const method = isEditing ? "PUT" : "POST";
    const body = isEditing
      ? {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          username: form.username,
          phoneNumber: form.phoneNumber,
          department: form.department,
          jobTitle: form.jobTitle,
          managerEmail: form.managerEmail,
          employmentType: form.employmentType,
          contractDuration: form.contractDuration,
          status: form.status,
          startDate: form.startDate,
          location: form.location,
          country: form.country,
          state: form.state,
          streetAddress: form.streetAddress
        }
      : form;

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      router.push("/employees");
      router.refresh();
      return;
    }

    const payload = await response.json().catch(() => ({}));
    setErrors(payload.errors ?? { form: [payload.error ?? "Unable to save employee"] });
    setIsSaving(false);
  }

  return (
    <form className="employee-form-shell" onSubmit={submit}>
      <aside className="employee-form-aside panel">
        <p className="form-eyebrow">Success Day</p>
        <h1>{isEditing ? "Edit employee profile" : "Register a new employee"}</h1>
        <p className="muted">A structured workflow for enterprise HR records, lifecycle details, and location data.</p>

        <div className="form-progress">
          <div className="form-progress-bar" style={{ width: `${completion}%` }} />
        </div>

        <ol className="form-step-list">
          {steps.map((step, index) => (
            <li key={step.title} className={index === activeStep ? "active" : index < activeStep ? "complete" : "idle"}>
              <button type="button" onClick={() => setActiveStep(index)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.description}</p>
                </div>
              </button>
            </li>
          ))}
        </ol>

        <div className="form-summary">
          <div>
            <span>Employee</span>
            <strong>
              {form.firstName || "New hire"} {form.lastName || "profile"}
            </strong>
          </div>
          <div>
            <span>Department</span>
            <strong>{form.department || "Not selected"}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{form.status}</strong>
          </div>
        </div>
      </aside>

      <section className="employee-form-panel panel">
        <div className="employee-form-header">
          <div>
            <p className="eyebrow">{currentStep.title}</p>
            <h2>{currentStep.description}</h2>
          </div>
          <span className="form-step-pill">
            Step {activeStep + 1} of {steps.length}
          </span>
        </div>

        {activeStep === 0 ? (
          <div className="form-section form-section-highlight">
            <h2>Identity</h2>
            <div className="form-grid">
              {!isEditing ? (
                <Field label="Employee ID" error={errors.employeeId?.[0]}>
                  <input value={form.employeeId ?? ""} onChange={(event) => update("employeeId", event.target.value)} />
                </Field>
              ) : (
                <Field label="Employee ID">
                  <input value={form.employeeId ?? ""} readOnly />
                </Field>
              )}
              <Field label="First Name" error={errors.firstName?.[0]}>
                <input value={form.firstName} onChange={(event) => update("firstName", event.target.value)} />
              </Field>
              <Field label="Last Name" error={errors.lastName?.[0]}>
                <input value={form.lastName} onChange={(event) => update("lastName", event.target.value)} />
              </Field>
              <Field label="Email" error={errors.email?.[0]}>
                <input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
              </Field>
              <Field label="Username" error={errors.username?.[0]}>
                <input value={form.username} onChange={(event) => update("username", event.target.value)} />
              </Field>
              <Field label="Phone Number" error={errors.phoneNumber?.[0]}>
                <input type="tel" value={form.phoneNumber} onChange={(event) => update("phoneNumber", event.target.value)} />
              </Field>
            </div>
          </div>
        ) : null}

        {activeStep === 1 ? (
          <div className="form-section form-section-highlight">
            <h2>Work Details</h2>
            <div className="form-grid">
              <Field label="Department" error={errors.department?.[0]}>
                <select value={form.department} onChange={(event) => update("department", event.target.value)}>
                  <option value="">Select department</option>
                  {departmentValues.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Job Title" error={errors.jobTitle?.[0]}>
                <input value={form.jobTitle} onChange={(event) => update("jobTitle", event.target.value)} />
              </Field>
              <Field label="Manager Email" error={errors.managerEmail?.[0]}>
                <input type="email" value={form.managerEmail} onChange={(event) => update("managerEmail", event.target.value)} />
              </Field>
              <Field label="Employment Type" error={errors.employmentType?.[0]}>
                <select value={form.employmentType} onChange={(event) => update("employmentType", event.target.value)}>
                  {employmentTypeValues.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Contract Duration" error={errors.contractDuration?.[0]}>
                <input placeholder="12 months, ongoing, or end date" value={form.contractDuration} onChange={(event) => update("contractDuration", event.target.value)} />
              </Field>
              <Field label="Status" error={errors.status?.[0]}>
                <select value={form.status} onChange={(event) => update("status", event.target.value)}>
                  {statusValues.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Start Date" error={errors.startDate?.[0]}>
                <input type="date" value={form.startDate} onChange={(event) => update("startDate", event.target.value)} />
              </Field>
            </div>
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="form-section form-section-highlight">
            <h2>Location</h2>
            <div className="form-grid">
              <Field label="Location" error={errors.location?.[0]}>
                <input placeholder="Office, remote, or site" value={form.location} onChange={(event) => update("location", event.target.value)} />
              </Field>
              <Field label="Country" error={errors.country?.[0]}>
                <input value={form.country} onChange={(event) => update("country", event.target.value)} />
              </Field>
              <Field label="State" error={errors.state?.[0]}>
                <input value={form.state} onChange={(event) => update("state", event.target.value)} />
              </Field>
              <Field label="Street Address" error={errors.streetAddress?.[0]}>
                <input value={form.streetAddress} onChange={(event) => update("streetAddress", event.target.value)} />
              </Field>
            </div>
          </div>
        ) : null}

        {errors.form?.[0] ? <p className="field-error form-error">{errors.form[0]}</p> : null}

        <div className="form-actions">
          <button type="button" className="secondary" onClick={() => setActiveStep((current) => Math.max(current - 1, 0))} disabled={activeStep === 0 || isSaving}>
            Back
          </button>
          {activeStep < steps.length - 1 ? (
            <button type="submit" disabled={isSaving}>
              Continue
            </button>
          ) : (
            <button disabled={isSaving}>{isSaving ? "Saving..." : isEditing ? "Update Employee" : "Save Employee"}</button>
          )}
          <button className="secondary" type="button" onClick={() => router.push("/employees") }>
            Cancel
          </button>
        </div>
      </section>
    </form>
  );
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