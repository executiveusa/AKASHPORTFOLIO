import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "El Panorama · SYNTHIA™",
  description: "Client project management portal — Kupuri Media",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
