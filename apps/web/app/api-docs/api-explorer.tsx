"use client";

import { useState } from "react";

const defaultBody = `{
  "employeeId": "E1004",
  "firstName": "Jordan",
  "lastName": "Taylor",
  "email": "jordan.taylor@example.com",
  "username": "jordan.taylor",
  "phoneNumber": "+1 555 0104",
  "department": "Security",
  "jobTitle": "Security Engineer",
  "managerEmail": "manager@example.com",
  "employmentType": "FULL_TIME",
  "contractDuration": "",
  "status": "ACTIVE",
  "startDate": "2026-02-15",
  "location": "Remote",
  "country": "United States",
  "state": "Illinois",
  "streetAddress": ""
}`;

export default function ApiExplorer() {
  const [path, setPath] = useState("/api/employees");
  const [method, setMethod] = useState("GET");
  const [body, setBody] = useState(defaultBody);
  const [auth, setAuth] = useState("Bearer dev-scim-token");
  const [result, setResult] = useState("");

  async function send() {
    setResult("Loading...");
    const headers: Record<string, string> = {};

    if (path.includes("/scim/")) {
      headers.Authorization = auth;
    }

    if (method !== "GET") {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(path, {
      method,
      headers,
      body: method === "GET" ? undefined : body
    });
    const text = await response.text();

    try {
      setResult(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      setResult(text);
    }
  }

  return (
    <div className="api-explorer">
      <div className="form-grid">
        <label>
          Method
          <select value={method} onChange={(event) => setMethod(event.target.value)}>
            {["GET", "POST", "PUT", "PATCH", "DELETE"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Path
          <select value={path} onChange={(event) => setPath(event.target.value)}>
            <option value="/api/employees">/api/employees</option>
            <option value="/api/scim/v2/Users">/api/scim/v2/Users</option>
            <option value="/api/scim/v2/ServiceProviderConfig">/api/scim/v2/ServiceProviderConfig</option>
            <option value="/api/scim/v2/Schemas">/api/scim/v2/Schemas</option>
            <option value="/api/scim/v2/ResourceTypes">/api/scim/v2/ResourceTypes</option>
          </select>
        </label>
        <label>
          SCIM Authorization
          <input value={auth} onChange={(event) => setAuth(event.target.value)} />
        </label>
      </div>
      <label className="api-body">
        JSON Body
        <textarea value={body} onChange={(event) => setBody(event.target.value)} />
      </label>
      <button type="button" onClick={send}>
        Send Request
      </button>
      <pre>{result}</pre>
    </div>
  );
}
