import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Success Day",
  description: "Minimal HR source application for IAM and IGA labs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
