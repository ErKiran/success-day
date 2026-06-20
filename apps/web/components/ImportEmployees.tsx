"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export default function ImportEmployees() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = inputRef.current?.files?.[0];

    if (!file) {
      setMessage("Choose a CSV or JSON file first.");
      return;
    }

    setIsImporting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/employees/import", {
      method: "POST",
      body: formData
    });
    const payload = await response.json().catch(() => ({}));

    if (response.ok) {
      setMessage(`Imported ${payload.imported} employees.`);
      router.refresh();
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } else {
      setMessage(payload.error ?? "Import failed.");
    }

    setIsImporting(false);
  }

  return (
    <form className="import-box" onSubmit={submit}>
      <input ref={inputRef} type="file" accept=".csv,.json,text/csv,application/json" />
      <button type="submit" disabled={isImporting}>
        {isImporting ? "Importing..." : "Import"}
      </button>
      {message ? <span className="muted">{message}</span> : null}
    </form>
  );
}
