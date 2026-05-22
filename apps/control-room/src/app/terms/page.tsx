import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Términos de Uso | SYNTHIA™ 3.0",
  description: "Términos y condiciones de uso de SYNTHIA™ 3.0 y Kupuri Media™.",
};

const SECTIONS = [
  {
    id: "aceptacion",
    title: "1. Aceptación",
    body: `Al acceder y usar SYNTHIA™ 3.0 aceptas estos términos en su totalidad. Si no estás de acuerdo, no uses la plataforma. Estos términos aplican a todos los usuarios: free, pro y operadores.`,
  },
  {
    id: "descripcion",
    title: "2. Descripción del servicio",
    body: `SYNTHIA™ 3.0 es una plataforma de agentes de inteligencia artificial diseñada para automatizar operaciones empresariales. El servicio incluye: ejecución de tareas por agentes de IA, almacenamiento de hilos y memoria, integraciones con servicios de terceros, y herramientas de coordinación de equipos.`,
  },
  {
    id: "uso-aceptable",
    title: "3. Uso aceptable",
    body: `Puedes usar SYNTHIA™ para actividades empresariales lícitas. Queda prohibido: usar el servicio para generar contenido ilegal, intentar acceder a datos de otros usuarios, realizar ingeniería inversa de los modelos o la plataforma, enviar spam o contenido malicioso a través de las integraciones, y sobrecargar intencionalmente la infraestructura.`,
  },
  {
    id: "propiedad",
    title: "4. Propiedad intelectual",
    body: `Todo el contenido generado a través de SYNTHIA™ usando tus datos e instrucciones es tuyo. Kupuri Media™ retiene los derechos sobre la plataforma, los agentes base, el código y la marca SYNTHIA™. Al usar el servicio nos otorgas una licencia limitada para procesar tu contenido únicamente para prestarte el servicio.`,
  },
  {
    id: "pagos",
    title: "5. Pagos y cancelación",
    body: `Los planes de pago se cobran mensual o anualmente según elijas. Puedes cancelar en cualquier momento; el acceso continúa hasta el final del período pagado. No se realizan reembolsos por fracciones de mes, salvo error de facturación imputable a Kupuri Media™. Los precios pueden cambiar con 30 días de aviso previo.`,
  },
  {
    id: "limitacion",
    title: "6. Limitación de responsabilidad",
    body: `SYNTHIA™ se provee "tal cual". Kupuri Media™ no garantiza disponibilidad ininterrumpida ni resultados específicos de los agentes. En ningún caso la responsabilidad total de Kupuri Media™ excederá el monto pagado por el usuario en los últimos 12 meses. No somos responsables por decisiones empresariales tomadas con base en las salidas de los agentes.`,
  },
  {
    id: "modificaciones",
    title: "7. Modificaciones",
    body: `Podemos actualizar estos términos con previo aviso de 14 días por correo electrónico. Los cambios materiales requieren tu consentimiento activo para continuar usando el servicio.`,
  },
  {
    id: "ley",
    title: "8. Ley aplicable",
    body: `Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Cualquier disputa se resolverá en los tribunales competentes de la Ciudad de México, salvo acuerdo contrario.`,
  },
];

export default function TermsPage() {
  return (
    <>
      <div style={{ minHeight: "100vh", background: "#fdfcfa" }}>
        {/* Header */}
        <div style={{ background: "#0d0d0d", padding: "48px 24px 40px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <Link
              href="/"
              style={{ fontSize: 12, color: "#888", textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}
            >
              ← Inicio
            </Link>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "16px 0 8px", letterSpacing: "-0.03em" }}>
              Términos de Uso
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
              Última actualización: mayo 2026 · Kupuri Media™ · Ciudad de México
            </p>
          </div>
        </div>

        {/* Quick nav */}
        <div style={{ borderBottom: "1px solid #e5e3df", background: "#fff", padding: "12px 24px" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16 }}>
            {SECTIONS.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                style={{ fontSize: 12, color: "#888", textDecoration: "none" }}
              >
                {s.title}
              </a>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {SECTIONS.map(s => (
              <div key={s.id} id={s.id}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0d0d0d", marginBottom: 10, letterSpacing: "-0.01em" }}>
                  {s.title}
                </h2>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, margin: 0 }}>
                  {s.body}
                </p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, padding: "20px 22px", background: "#f8f7f5", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#555", margin: 0 }}>
              ¿Tienes preguntas sobre estos términos?
            </p>
            <a
              href="mailto:kupurimedia@gmail.com"
              style={{ fontSize: 13, color: "#0d0d0d", fontWeight: 600, textDecoration: "none" }}
            >
              kupurimedia@gmail.com →
            </a>
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 16 }}>
            <Link href="/privacy" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>
              Ver Política de Privacidad →
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
