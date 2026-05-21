"use client";

import Link from "next/link";

const EXAMPLES = [
  { slug: "out-of-home-campaign",          icon: "🏙️", title: "Campaña Out-of-Home",          desc: "Estrategia completa OOH para lanzamiento de marca en CDMX." },
  { slug: "apparel-launch",                icon: "👗", title: "Lanzamiento de Ropa",            desc: "Plan go-to-market para línea de moda latina." },
  { slug: "hiring-command-center",         icon: "🎯", title: "Centro de Contratación",        desc: "Flujo automatizado de reclutamiento y onboarding." },
  { slug: "small-business-rebrand",        icon: "✨", title: "Rebranding PYME",               desc: "Identidad visual + estrategia de comunicación completa." },
  { slug: "podcast-launch",               icon: "🎙️", title: "Lanzamiento de Podcast",        desc: "Estrategia, contenido y distribución en 30 días." },
  { slug: "product-merchandising",         icon: "🛍️", title: "Merchandising de Producto",    desc: "Copywriting y activos visuales para e-commerce." },
  { slug: "cinematic-real-estate-video",   icon: "🎬", title: "Video Inmobiliario",            desc: "Producción cinematográfica de listing premium." },
  { slug: "multi-channel-product-launch",  icon: "🚀", title: "Lanzamiento Multi-Canal",       desc: "Coordinación simultánea en 6 plataformas digitales." },
  { slug: "personalized-prospect-outreach",icon: "💌", title: "Outreach Personalizado",        desc: "Secuencias de venta personalizadas por segmento." },
  { slug: "startup-investment-research",   icon: "📈", title: "Research de Inversión",         desc: "Due diligence y análisis de oportunidades para startups." },
  { slug: "brand-sponsorship-strategy",    icon: "🤝", title: "Estrategia de Patrocinios",     desc: "Kit completo de patrocinios para eventos y creadores." },
  { slug: "real-estate-listing-kit",       icon: "🏡", title: "Kit de Listado Inmobiliario",   desc: "Foto, descripción, precio y anuncio optimizado." },
];

export function FeaturedExamplesGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: 12,
      }}
    >
      {EXAMPLES.map(ex => (
        <Link
          key={ex.slug}
          href={`/featured/${ex.slug}`}
          style={{
            display: "block",
            padding: "16px",
            background: "#fff",
            border: "1px solid #e5e3df",
            borderRadius: 10,
            textDecoration: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "#0d0d0d";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e5e3df";
            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 8 }}>{ex.icon}</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0d0d0d", marginBottom: 4 }}>{ex.title}</div>
          <div style={{ fontSize: 12, color: "#888", lineHeight: 1.5 }}>{ex.desc}</div>
          <div style={{ marginTop: 12, fontSize: 11, color: "#bbb" }}>Hecho con Synthia →</div>
        </Link>
      ))}
    </div>
  );
}
