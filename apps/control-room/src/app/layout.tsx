import type { Metadata } from "next";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

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
    <html lang="es" className={playfairDisplay.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
