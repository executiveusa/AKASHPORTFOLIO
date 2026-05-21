"use client";

import { useEffect, useState } from "react";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  category: string;
}

const SEED_INTEGRATIONS: Integration[] = [
  { id: "google-drive",  name: "Google Drive",    description: "Accede y guarda archivos",    icon: "📁", connected: false, category: "Almacenamiento" },
  { id: "notion",        name: "Notion",           description: "Sincroniza bases de datos",   icon: "📓", connected: false, category: "Productividad"  },
  { id: "slack",         name: "Slack",            description: "Envía mensajes y alertas",    icon: "💬", connected: false, category: "Comunicación"   },
  { id: "gmail",         name: "Gmail",            description: "Envía y lee correos",         icon: "✉️", connected: false, category: "Comunicación"   },
  { id: "airtable",      name: "Airtable",         description: "Gestión de datos estructurada", icon: "📊", connected: false, category: "Datos"        },
  { id: "shopify",       name: "Shopify",          description: "E-commerce y pedidos",        icon: "🛒", connected: false, category: "E-commerce"    },
  { id: "hubspot",       name: "HubSpot",          description: "CRM y marketing",             icon: "🎯", connected: false, category: "CRM"           },
  { id: "zapier",        name: "Zapier",           description: "Automatizaciones externas",   icon: "⚡", connected: false, category: "Automatización"},
  { id: "stripe",        name: "Stripe",           description: "Pagos y facturación",         icon: "💳", connected: false, category: "Finanzas"      },
  { id: "instagram",     name: "Instagram",        description: "Publica y analiza contenido", icon: "📸", connected: false, category: "Redes Sociales"},
  { id: "whatsapp",      name: "WhatsApp",         description: "Mensajería empresarial",      icon: "📱", connected: false, category: "Comunicación"  },
  { id: "calendar",      name: "Google Calendar",  description: "Agenda reuniones y eventos",  icon: "📅", connected: false, category: "Productividad" },
];

export function IntegrationsGrid() {
  const [integrations, setIntegrations] = useState<Integration[]>(SEED_INTEGRATIONS);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todas");

  const categories = ["Todas", ...Array.from(new Set(SEED_INTEGRATIONS.map(i => i.category)))];

  useEffect(() => {
    fetch("/api/synthia/integrations")
      .then(r => r.json())
      .then(d => {
        if (Array.isArray(d.integrations)) {
          setIntegrations(prev => prev.map(p => {
            const remote = d.integrations.find((r: Integration) => r.id === p.id);
            return remote ? { ...p, connected: remote.connected } : p;
          }));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = async (id: string, currently: boolean) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !currently } : i));
    await fetch("/api/synthia/integrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, connected: !currently }),
    }).catch(() => {
      setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: currently } : i));
    });
  };

  const visible = filter === "Todas"
    ? integrations
    : integrations.filter(i => i.category === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            style={{
              padding: "5px 12px", borderRadius: 20, border: "1px solid",
              borderColor: filter === c ? "#0d0d0d" : "#e5e3df",
              background: filter === c ? "#0d0d0d" : "#fff",
              color: filter === c ? "#fff" : "#555",
              fontSize: 11, cursor: "pointer",
            }}
          >{c}</button>
        ))}
      </div>

      {loading && <div style={{ color: "#999", fontSize: 13 }}>Cargando integraciones…</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
        {visible.map(intg => (
          <div
            key={intg.id}
            style={{
              padding: "14px 16px", background: "#fff", border: "1px solid",
              borderColor: intg.connected ? "#0d0d0d" : "#e5e3df",
              borderRadius: 10, display: "flex", alignItems: "center", gap: 12,
            }}
          >
            <span style={{ fontSize: 24, flexShrink: 0 }}>{intg.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#0d0d0d" }}>{intg.name}</div>
              <div style={{ fontSize: 11, color: "#888" }}>{intg.description}</div>
            </div>
            <button
              onClick={() => toggle(intg.id, intg.connected)}
              style={{
                padding: "5px 12px", borderRadius: 6, border: "1px solid",
                borderColor: intg.connected ? "#0d0d0d" : "#e5e3df",
                background: intg.connected ? "#0d0d0d" : "#fff",
                color: intg.connected ? "#fff" : "#555",
                fontSize: 11, cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              {intg.connected ? "Conectado" : "Conectar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
