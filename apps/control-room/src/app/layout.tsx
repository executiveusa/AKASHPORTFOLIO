import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Synthia™ 3.0 - Sistema Operativo Agentico",
  description: "Synthia™ es tu CEO invisible para automatizar tareas y controlar equipos de agentes de IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
