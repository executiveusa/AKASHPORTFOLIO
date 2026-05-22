import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Privacidad | SYNTHIA™ 3.0",
  description: "Política de privacidad de SYNTHIA™ 3.0 y Kupuri Media™.",
};

const SECTIONS = [
  {
    id: "recopilacion",
    title: "1. Datos que recopilamos",
    body: `Recopilamos únicamente los datos necesarios para operar la plataforma: dirección de correo electrónico para autenticación, datos de uso de agentes e hilos, y preferencias de configuración. No recopilamos datos financieros personales más allá de lo necesario para procesar pagos a través de nuestro proveedor (Stripe).`,
  },
  {
    id: "uso",
    title: "2. Cómo usamos tus datos",
    body: `Los datos se usan exclusivamente para: operar y mejorar SYNTHIA™, personalizar tu experiencia, enviarte notificaciones del servicio y responder solicitudes de soporte. Nunca vendemos tus datos a terceros.`,
  },
  {
    id: "almacenamiento",
    title: "3. Almacenamiento y seguridad",
    body: `Tus datos se almacenan en servidores seguros con cifrado en reposo y en tránsito. Usamos Row-Level Security (RLS) en la base de datos para garantizar que solo tú puedas acceder a tu información. El acceso administrativo es auditado.`,
  },
  {
    id: "terceros",
    title: "4. Servicios de terceros",
    body: `Integramos proveedores de IA (incluyendo modelos de lenguaje), servicios de pago (Stripe), y autenticación (NextAuth). Cada proveedor cuenta con su propia política de privacidad. No compartimos tu contenido con terceros sin tu consentimiento, salvo cuando sea necesario para ejecutar las tareas que tú solicitas.`,
  },
  {
    id: "derechos",
    title: "5. Tus derechos",
    body: `Tienes derecho a acceder, corregir o eliminar tus datos en cualquier momento. Para solicitar la eliminación de tu cuenta y datos asociados, escríbenos a kupurimedia@gmail.com con el asunto "Eliminación de cuenta". Procesamos las solicitudes en un plazo máximo de 15 días hábiles.`,
  },
  {
    id: "cookies",
    title: "6. Cookies",
    body: `Usamos cookies de sesión estrictamente necesarias para la autenticación. No usamos cookies de rastreo de terceros ni publicidad.`,
  },
  {
    id: "cambios",
    title: "7. Cambios a esta política",
    body: `Cualquier cambio significativo será notificado por correo electrónico con al menos 14 días de anticipación. El uso continuado de la plataforma después de ese plazo constituye aceptación de los cambios.`,
  },
];

export default function PrivacyPage() {
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
              Política de Privacidad
            </h1>
            <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
              Última actualización: mayo 2026 · Kupuri Media™ · Ciudad de México
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px" }}>
          <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7, marginBottom: 40, borderLeft: "3px solid #e5e3df", paddingLeft: 16 }}>
            En Kupuri Media™ creemos que la privacidad es un derecho, no una opción. Esta política explica de forma clara qué datos recopilamos, cómo los usamos y qué control tienes sobre ellos.
          </p>

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

          <div style={{ marginTop: 48, padding: "20px 22px", background: "#f8f7f5", borderRadius: 8 }}>
            <p style={{ fontSize: 13, color: "#555", margin: "0 0 6px" }}>
              ¿Tienes preguntas sobre esta política?
            </p>
            <a
              href="mailto:kupurimedia@gmail.com"
              style={{ fontSize: 13, color: "#0d0d0d", fontWeight: 600, textDecoration: "none" }}
            >
              kupurimedia@gmail.com →
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
