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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kupuri-media-cdmx.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SYNTHIA™ 3.0 — Tu CEO Invisible para Empresarias LATAM",
    template: "%s | SYNTHIA™ 3.0",
  },
  description: "Sistema Operativo Agéntico para empresarias latinoamericanas. Automatiza operaciones con 9 agentes de IA especializados. Más poderoso que OpenAI, más seguro que Claude.",
  keywords: [
    "agentes IA LATAM", "automatización empresarial México", "CEO digital", "SYNTHIA",
    "Kupuri Media", "IA para empresarias", "sistema operativo agéntico", "voice AI español",
    "arbitraje LATAM", "automatización CDMX",
  ],
  authors: [{ name: "Kupuri Media™", url: siteUrl }],
  creator: "Kupuri Media™",
  publisher: "Kupuri Media™",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SYNTHIA™ 3.0" },
  openGraph: {
    type: "website",
    locale: "es_MX",
    alternateLocale: ["en_US"],
    url: siteUrl,
    siteName: "SYNTHIA™ 3.0 by Kupuri Media™",
    title: "SYNTHIA™ 3.0 — Tu CEO Invisible para Empresarias LATAM",
    description: "9 agentes de IA especializados coordinados por Hermes. Automatiza, delega y escala tu empresa desde CDMX.",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SYNTHIA™ 3.0 — Sistema Operativo Agéntico",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@KupuriMedia",
    creator: "@KupuriMedia",
    title: "SYNTHIA™ 3.0 — Tu CEO Invisible",
    description: "Sistema Operativo Agéntico para empresarias latinoamericanas. 9 esferas. 1 cerebro. Resultados reales.",
    images: [`${siteUrl}/og-image.png`],
  },
  alternates: {
    canonical: siteUrl,
    languages: {
      "es-MX": `${siteUrl}/landing`,
      "en-US": `${siteUrl}/landing?lang=en`,
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1a1208",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "Kupuri Media™",
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
      sameAs: [
        "https://twitter.com/KupuriMedia",
      ],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Santa María la Ribera",
        addressRegion: "Ciudad de México",
        addressCountry: "MX",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${siteUrl}/#software`,
      name: "SYNTHIA™ 3.0",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        description: "Plan gratuito disponible",
      },
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "SYNTHIA™ 3.0 | Kupuri Media™",
      inLanguage: ["es-MX", "en-US"],
      publisher: { "@id": `${siteUrl}/#organization` },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/blog?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfairDisplay.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
