"use client";

import SwaggerUI from "swagger-ui-react";

export default function SwaggerDocs() {
  return (
    <main className="swagger-docs">
      <SwaggerUI url="/api/openapi" />
    </main>
  );
}
