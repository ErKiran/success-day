import type { Metadata } from "next";
import "swagger-ui-react/swagger-ui.css";
import "./globals.css";
import ThemeProvider from "./theme-provider";

export const metadata: Metadata = {
  title: "Success Day",
  description: "Minimal HR source application for IAM and IGA labs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
