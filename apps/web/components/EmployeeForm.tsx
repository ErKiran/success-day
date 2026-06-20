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
    <form onSubmit={submit}>
      <div className="form-section">
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
      <div className="form-section">
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
      <div className="form-section">
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
