import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Documentación | SYNTHIA™ 3.0",
  description: "Guías, referencias de API y recursos para usar SYNTHIA™ 3.0.",
};

const SECTIONS = [
  {
    title: "Inicio rápido",
    items: [
      { label: "¿Qué es SYNTHIA™?", href: "#que-es" },
      { label: "Crea tu primer hilo", href: "/threads/new" },
      { label: "Configura tus integraciones", href: "/integraciones" },
    ],
  },
  {
    title: "Agentes",
    items: [
      { label: "Cómo funcionan los agentes", href: "#agentes" },
      { label: "Crear un agente personalizado", href: "/agents/new" },
      { label: "Modos de ejecución", href: "#modos" },
    ],
  },
  {
    title: "Plataforma",
    items: [
      { label: "Cockpit — panel de operaciones", href: "/cockpit" },
      { label: "Theater — presentaciones", href: "/theater" },
      { label: "Watcher — telemetría en vivo", href: "/watcher" },
    ],
  },
  {
    title: "API & Seguridad",
    items: [
      { label: "Referencia de API REST", href: "#api-ref" },
      { label: "Autenticación y sesiones", href: "#auth" },
      { label: "Políticas RLS y datos", href: "#rls" },
    ],
  },
];

export default function DocsPage() {
  return (
    <>
      <div style={{ minHeight: "100vh", background: "#fdfcfa" }}>
        {/* Header */}
        <div style={{ background: "#0d0d0d", padding: "48px 24px 40px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <Link
              href="/"
              style={{ fontSize: 12, color: "#888", textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}
            >
              ← Inicio
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "16px 0 8px", letterSpacing: "-0.03em" }}>
              Documentación
            </h1>
            <p style={{ fontSize: 15, color: "#999", margin: 0 }}>
              Todo lo que necesitas para aprovechar SYNTHIA™ 3.0 al máximo.
            </p>
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
          {/* Notice */}
          <div style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: 8,
            padding: "14px 18px",
            marginBottom: 40,
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <p style={{ margin: 0, fontSize: 13, color: "#92400e", lineHeight: 1.6 }}>
              La documentación completa está en construcción. Mientras tanto, los enlaces de abajo te llevan a las secciones del producto disponibles hoy.
            </p>
          </div>

          {/* Section grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {SECTIONS.map(section => (
              <div
                key={section.title}
                style={{
                  border: "1px solid #e5e3df",
                  borderRadius: 10,
                  padding: "20px 22px",
                  background: "#fff",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#888", marginBottom: 14 }}>
                  {section.title}
                </div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {section.items.map(item => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        style={{ fontSize: 14, color: "#0d0d0d", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
                      >
                        <span style={{ color: "#bbb" }}>→</span> {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div style={{ marginTop: 48, padding: "24px", background: "#f8f7f5", borderRadius: 10, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#555", margin: "0 0 12px" }}>
              ¿No encuentras lo que buscas?
            </p>
            <a
              href="mailto:kupurimedia@gmail.com"
              style={{
                display: "inline-block", padding: "9px 20px", background: "#0d0d0d",
                color: "#fff", borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: "none",
              }}
            >
              Escríbenos
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
