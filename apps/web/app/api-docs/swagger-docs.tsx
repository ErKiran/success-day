"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function SwaggerDocs() {
  return (
    <div className="swagger-shell">
      <SwaggerUI
        deepLinking
        displayRequestDuration
        docExpansion="list"
        filter
        showExtensions
        showCommonExtensions
        url="/api/openapi"
      />
    </div>
  );
}