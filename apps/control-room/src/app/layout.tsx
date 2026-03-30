import type { Metadata, Viewport } from "next";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { Breadcrumb } from "@/components/Breadcrumb";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

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
        <div className="flex flex-col min-h-screen">
          <Breadcrumb />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
