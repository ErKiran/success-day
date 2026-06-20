"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function logout() {
    setIsLoggingOut(true);
    const response = await fetch("/api/logout", { method: "POST" }).catch(() => null);
    const payload = await response?.json().catch(() => null);

    window.localStorage.clear();
    window.sessionStorage.clear();

    window.location.assign(payload?.logoutUrl ?? "/login");
  }

  return (
    <button className="secondary" type="button" onClick={logout} disabled={isLoggingOut}>
      {isLoggingOut ? "Logging out..." : "Log Out"}
    </button>
  );
}
