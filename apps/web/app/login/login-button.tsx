"use client";

import { signIn } from "next-auth/react";

export default function LoginButton() {
  return <button onClick={() => signIn("keycloak", { callbackUrl: "/employees" })}>Login with Keycloak</button>;
}
