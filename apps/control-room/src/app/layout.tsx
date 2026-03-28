import type { Metadata, Viewport } from "next";
import "./globals.css";

// Fonts loaded via globals.css @import — avoids build-time Google Fonts fetch
const playfairDisplay = { variable: "--font-playfair-display", className: "font-playfair" };
const spaceGrotesk = { variable: "--font-space-grotesk", className: "font-space-grotesk" };

export const metadata: Metadata = {
  title: "Synthia™ 3.0 — Sistema Operativo Agéntico",
  description: "Tu CEO invisible. Automatiza operaciones, coordina agentes de IA y genera ingresos en toda Latinoamérica.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Synthia 3.0" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1a1208",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfairDisplay.variable} ${spaceGrotesk.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
