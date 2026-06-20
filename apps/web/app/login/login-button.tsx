"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <button className="login-button" onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}>
      Login with Keycloak
    </button>
  );
}
