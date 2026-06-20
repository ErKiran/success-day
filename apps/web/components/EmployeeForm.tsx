"use client";

import { employmentTypeValues, statusValues } from "@/lib/validators";
import { useRouter } from "next/navigation";
import { useState } from "react";

type FormEmployee = {
  id?: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  department: string;
  jobTitle: string;
  managerEmail: string;
  employmentType: string;
  status: string;
  startDate: string;
  location: string;
};

type Errors = Record<string, string[] | undefined>;

const blankEmployee: FormEmployee = {
  employeeId: "",
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  department: "",
  jobTitle: "",
  managerEmail: "",
  employmentType: "FULL_TIME",
  status: "ACTIVE",
  startDate: "",
  location: ""
};

export default function EmployeeForm({ employee }: { employee?: FormEmployee }) {
  const router = useRouter();
  const [form, setForm] = useState<FormEmployee>(employee ?? blankEmployee);
  const [errors, setErrors] = useState<Errors>({});
  const [isSaving, setIsSaving] = useState(false);
  const isEditing = Boolean(employee?.id);

  function update(field: keyof FormEmployee, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
          department: form.department,
          jobTitle: form.jobTitle,
          managerEmail: form.managerEmail,
          employmentType: form.employmentType,
          status: form.status,
          startDate: form.startDate,
          location: form.location
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
    <form onSubmit={submit}>
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
        <Field label="Department" error={errors.department?.[0]}>
          <input value={form.department} onChange={(event) => update("department", event.target.value)} />
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
        <Field label="Location" error={errors.location?.[0]}>
          <input value={form.location} onChange={(event) => update("location", event.target.value)} />
        </Field>
      </div>
      {errors.form?.[0] ? <p className="field-error">{errors.form[0]}</p> : null}
      <div className="form-actions">
        <button disabled={isSaving}>{isSaving ? "Saving..." : "Save"}</button>
        <button className="secondary" type="button" onClick={() => router.push("/employees")}>
          Cancel
        </button>
      </div>
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
