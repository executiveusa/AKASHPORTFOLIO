"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/synthia/AppShell";
import { useEffect, useState } from "react";

interface FeaturedExample {
  slug: string;
  icon: string;
  title: string;
  desc: string;
  prompt: string;
  tags: string[];
  agent_id: string;
}

const EXAMPLES: Record<string, FeaturedExample> = {
  "out-of-home-campaign": {
    slug: "out-of-home-campaign", icon: "🏙️",
    title: "Campaña Out-of-Home",
    desc: "Estrategia completa OOH para lanzamiento de marca en CDMX.",
    prompt: "Diseña una campaña out-of-home completa para el lanzamiento de una nueva marca en CDMX. Incluye ubicaciones estratégicas, creativos, presupuesto estimado y métricas de éxito.",
    tags: ["Marketing", "OOH", "CDMX", "Marca"],
    agent_id: "cazadora",
  },
  "apparel-launch": {
    slug: "apparel-launch", icon: "👗",
    title: "Lanzamiento de Ropa",
    desc: "Plan go-to-market para línea de moda latina.",
    prompt: "Crea un plan go-to-market completo para lanzar una línea de ropa latina. Incluye canales de venta, estrategia de precios, influencers clave y timeline de 90 días.",
    tags: ["Moda", "GTM", "E-commerce"],
    agent_id: "forjadora",
  },
  "hiring-command-center": {
    slug: "hiring-command-center", icon: "🎯",
    title: "Centro de Contratación",
    desc: "Flujo automatizado de reclutamiento y onboarding.",
    prompt: "Diseña un flujo automatizado de reclutamiento y onboarding para una startup tech de 20 personas. Incluye screening, entrevistas, evaluaciones y materiales de bienvenida.",
    tags: ["RRHH", "Automatización", "Onboarding"],
    agent_id: "synthia",
  },
  "small-business-rebrand": {
    slug: "small-business-rebrand", icon: "✨",
    title: "Rebranding PYME",
    desc: "Identidad visual + estrategia de comunicación completa.",
    prompt: "Desarrolla una estrategia de rebranding completa para una PYME de 5 años. Incluye análisis de marca actual, nueva identidad visual, tono de voz y plan de transición.",
    tags: ["Branding", "PYME", "Identidad"],
    agent_id: "forjadora",
  },
  "podcast-launch": {
    slug: "podcast-launch", icon: "🎙️",
    title: "Lanzamiento de Podcast",
    desc: "Estrategia, contenido y distribución en 30 días.",
    prompt: "Crea un plan de lanzamiento de podcast de 30 días. Incluye nombre, formato, primeros 10 temas, estrategia de distribución y cómo conseguir los primeros 1000 oyentes.",
    tags: ["Podcast", "Contenido", "Distribución"],
    agent_id: "forjadora",
  },
  "product-merchandising": {
    slug: "product-merchandising", icon: "🛍️",
    title: "Merchandising de Producto",
    desc: "Copywriting y activos visuales para e-commerce.",
    prompt: "Genera copywriting completo y activos visuales para una tienda de e-commerce. Incluye descripciones de producto, copy de anuncios, emails de carrito abandonado y página de colección.",
    tags: ["E-commerce", "Copy", "Conversión"],
    agent_id: "forjadora",
  },
  "cinematic-real-estate-video": {
    slug: "cinematic-real-estate-video", icon: "🎬",
    title: "Video Inmobiliario",
    desc: "Producción cinematográfica de listing premium.",
    prompt: "Crea un guión y plan de producción para un video cinematográfico de un listing inmobiliario premium. Incluye story, shots list, música y distribución en redes.",
    tags: ["Inmobiliario", "Video", "Premium"],
    agent_id: "forjadora",
  },
  "multi-channel-product-launch": {
    slug: "multi-channel-product-launch", icon: "🚀",
    title: "Lanzamiento Multi-Canal",
    desc: "Coordinación simultánea en 6 plataformas digitales.",
    prompt: "Diseña un lanzamiento coordinado en 6 plataformas: Instagram, TikTok, LinkedIn, Email, WhatsApp y YouTube. Calendarios, creativos y métricas por canal.",
    tags: ["Multi-canal", "Lanzamiento", "Digital"],
    agent_id: "synthia",
  },
  "personalized-prospect-outreach": {
    slug: "personalized-prospect-outreach", icon: "💌",
    title: "Outreach Personalizado",
    desc: "Secuencias de venta personalizadas por segmento.",
    prompt: "Crea secuencias de outreach personalizadas para 3 segmentos de clientes. Incluye LinkedIn, email frío, follow-ups y script de llamada para cada segmento.",
    tags: ["Ventas", "Outreach", "CRM"],
    agent_id: "alex",
  },
  "startup-investment-research": {
    slug: "startup-investment-research", icon: "📈",
    title: "Research de Inversión",
    desc: "Due diligence y análisis de oportunidades para startups.",
    prompt: "Realiza un análisis de due diligence para una startup de fintech en LATAM. Incluye análisis de mercado, competencia, equipo, métricas clave y riesgos.",
    tags: ["Inversión", "Fintech", "Due Diligence"],
    agent_id: "cazadora",
  },
  "brand-sponsorship-strategy": {
    slug: "brand-sponsorship-strategy", icon: "🤝",
    title: "Estrategia de Patrocinios",
    desc: "Kit completo de patrocinios para eventos y creadores.",
    prompt: "Desarrolla una estrategia de patrocinios completa para un festival de música latina. Incluye deck de ventas, paquetes de patrocinio, pricing y targets de marcas.",
    tags: ["Patrocinios", "Eventos", "Marca"],
    agent_id: "alex",
  },
  "real-estate-listing-kit": {
    slug: "real-estate-listing-kit", icon: "🏡",
    title: "Kit de Listado Inmobiliario",
    desc: "Foto, descripción, precio y anuncio optimizado.",
    prompt: "Crea un kit completo de listado para una propiedad residencial en CDMX. Incluye descripción en 3 idiomas, análisis de precio, anuncio para portales y estrategia de redes.",
    tags: ["Inmobiliario", "Kit", "Listado"],
    agent_id: "cazadora",
  },
};

export default function FeaturedSlugPage() {
  const params = useParams();
  const slug = params.slug as string;
  const example = EXAMPLES[slug];

  if (!example) {
    return (
      <AppShell>
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
          Ejemplo no encontrado.{" "}
          <Link href="/threads/new" style={{ color: "#0d0d0d", fontWeight: 600 }}>
            Ver todos los ejemplos →
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 640 }}>
        <Link href="/threads/new" style={{ fontSize: 12, color: "#888", textDecoration: "none", display: "block", marginBottom: 24 }}>
          ← Volver
        </Link>

        <div style={{ fontSize: 48, marginBottom: 16 }}>{example.icon}</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0d0d0d", marginBottom: 8 }}>
          {example.title}
        </h1>
        <p style={{ fontSize: 14, color: "#888", lineHeight: 1.6, marginBottom: 20 }}>
          {example.desc}
        </p>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
          {example.tags.map(tag => (
            <span key={tag} style={{ fontSize: 11, padding: "3px 10px", background: "#f0ede8", borderRadius: 10, color: "#555" }}>
              {tag}
            </span>
          ))}
        </div>

        <div style={{ padding: "16px 18px", background: "#f8f7f5", borderRadius: 10, marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Prompt sugerido
          </div>
          <div style={{ fontSize: 13, color: "#0d0d0d", lineHeight: 1.7 }}>
            {example.prompt}
          </div>
        </div>

        <Link
          href={`/threads/new?agent=${example.agent_id}&prompt=${encodeURIComponent(example.prompt)}`}
          style={{
            display: "inline-block", padding: "12px 28px",
            background: "#0d0d0d", color: "#fff",
            borderRadius: 8, fontSize: 14, fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Usar este ejemplo →
        </Link>
      </div>
    </AppShell>
  );
}
