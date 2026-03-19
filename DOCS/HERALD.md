# 🛠️ HERALD — Tu Biblioteca de Herramientas Viva
> **Para todos** — técnicos y no técnicos por igual
> *ZTE-20260319-0001 | Versión 1.0*

---

## 🟣 ¿Qué es HERALD?

Imagina que tienes un **asistente personal muy organizado** que guarda en una agenda inteligente *todas* las herramientas digitales que SYNTHIA™ puede usar — desde enviar tweets hasta hacer scraping de un sitio web competidor. Cada vez que un agente necesita hacer algo, le pregunta a HERALD: *"¿Quién sabe hacer esto?"* — y HERALD le responde con la herramienta exacta.

**HERALD** = **H**erramienta de **E**nrutamiento y **R**egistro de **A**gentes y **L**ógica **D**igital

---

## 🟡 ¿Por qué importa esto?

Sin HERALD, cada agente tendría que recordar por sí solo todas las herramientas disponibles. Con HERALD:

| Sin HERALD | Con HERALD |
|-----------|-----------|
| Cada agente adivina qué herramienta usar | Búsqueda inteligente: "necesito postear en redes" → respuesta exacta |
| Duplicación: 5 agentes llaman al mismo CLI 5 veces | Un registro central, un punto de control |
| No hay visibilidad de qué herramientas están caídas | Dashboard en tiempo real con semáforos verde/rojo |
| Modelos de lenguaje consumen 50x más tokens describiendo herramientas | Representación compacta: 96-99% ahorro de tokens |

---

## 🟢 Los 4 Bloques de HERALD

### 1. 📋 El Registro (Tool Registry)

```
ubicación: apps/control-room/src/lib/herald/tool-registry.ts
```

El registro es como la **guía de teléfonos** de todas las herramientas. Al arrancar el sistema:

1. Escanea las 52 herramientas de `marketingskills-main/tools/clis/`
2. Detecta los servidores MCP configurados (Notion, Vercel, Stripe, etc.)
3. Convierte cada herramienta a su "firma compacta" (mínimo de palabras, máximo de información)
4. Las almacena en Supabase — tabla `tool_registrations`

**Para Ivette:** Cada vez que instales una nueva herramienta, HERALD la descubre automáticamente. No hay pasos manuales.

---

### 2. 🔄 El Convertidor MCP→CLI

```
ubicación: apps/control-room/src/lib/herald/mcp-cli-converter.ts
```

Los servidores MCP hablan en un "idioma JSON muy detallado" que los modelos de IA entienden, pero que consume muchísimos *tokens* (créditos de IA). El convertidor transforma esto:

**Antes (MCP JSON): ~800 tokens**
```json
{
  "name": "create_page",
  "description": "Creates a new page in Notion workspace with specified properties...",
  "inputSchema": {
    "type": "object",
    "properties": {
      "parent": { "type": "object", "description": "Parent page or database..." },
      ...
    }
  }
}
```

**Después (CLI compacto): ~12 tokens**
```
notion create_page <parent_id> <title> [content]
```

**Para Ivette:** Ahorro de 96% en costos de API de IA. Cada conversación del consejo cuesta menos.

---

### 3. 🧭 El Router Semántico

```
ubicación: apps/control-room/src/lib/herald/router.ts
```

Cuando un agente dice: *"Quiero publicar un video en TikTok"*, el router:

1. **Busca** en la base vectorial (pgvector) herramientas con significado similar
2. **Clasifica** por puntuación de calidad (mejores herramientas primero)
3. **Ejecuta** la herramienta si se le pidió, o devuelve opciones si no
4. **Aprende**: si la herramienta funcionó bien, sube su puntuación de calidad. Si falló, la baja.

**Color del semáforo:**
- 🟢 `quality_score > 0.8` — herramienta confiable
- 🟡 `quality_score 0.5–0.8` — herramienta moderada, usar con cuidado
- 🔴 `quality_score < 0.5` — herramienta problemática, revisar

---

### 4. 🖥️ La Interfaz Visual (HeraldToolLibrary)

```
ubicación: apps/control-room/src/components/HeraldToolLibrary.tsx
ruta en app: /cockpit (panel inferior)
```

Vista en tiempo real de todas las herramientas. Funciones:

- **Buscar** por nombre o capacidad (ej: "video", "scraping", "social")
- **Filtrar** por tipo: CLI, MCP, Postiz, CLI-Anything
- **Ver semáforo** de salud de cada herramienta
- **Ejecutar** una herramienta directamente desde el dashboard
- **Bootstrap** — re-escanear y registrar todas las herramientas con un clic

---

## 🔵 Las Rutas API

| Ruta | Método | Qué hace |
|------|--------|---------|
| `/api/herald` | `GET` | Lista todas las herramientas registradas |
| `/api/herald` | `POST` | Dispara el bootstrap completo |
| `/api/herald/dispatch` | `POST` | Enrutar un intent a la herramienta correcta |
| `/api/herald/execute` | `POST` | Ejecutar una herramienta por ID directo |
| `/api/herald/init` | `POST` | Cold-start: registrar los 12 servidores MCP conocidos |

**Ejemplo de uso — dispatch:**
```bash
curl -X POST https://tu-app.vercel.app/api/herald/dispatch \
  -H "Content-Type: application/json" \
  -d '{ "intent": "Buscar tendencias de TikTok en México", "autoExecute": false }'
```

Respuesta:
```json
{
  "tool": {
    "name": "brightdata_search",
    "cli_signature": "brightdata_search <query> [country] [count]",
    "kind": "mcp",
    "quality_score": 0.87
  }
}
```

---

## ⚙️ La Base de Datos HERALD

HERALD requiere 4 tablas en Supabase. Si no las tienes, ejecuta:

```sql
-- Ir a: Supabase Studio → SQL Editor → pegar y ejecutar:
-- apps/control-room/src/lib/herald-schema.sql
```

**Tablas:**

| Tabla | Para qué |
|-------|---------|
| `vibe_nodes` | Nodos del Vibe Graph — recursos, agentes, tareas |
| `vibe_edges` | Conexiones entre nodos (con nivel de confianza) |
| `tool_registrations` | Todas las herramientas registradas en HERALD |
| `herald_route_log` | Historial de enrutamientos (para aprendizaje) |

---

## 🟠 Herramientas Registradas (al arrancar)

HERALD registra automáticamente:

### CLIs de Marketing (52 herramientas)
Localizadas en: `openclaw-logic/synthia-3.0-backend/skills.md/.../tools/clis/`

Incluye: social-post, email-campaign, video-generator, ad-copy, seo-audit, competitor-monitor, content-calendar, hashtag-suggest, influencer-lookup, y más.

### Servidores MCP (12 servidores)
```
notion       • cloudflare  • vercel      • stripe
gmail        • figma       • sentry      • canva
invideo      • paypal      • brightdata  • jcodemunch
```

### Postiz Social Media
Para publicación directa en: Instagram, TikTok, LinkedIn, Twitter/X, Facebook, YouTube

---

## 🔴 Resolución de Problemas

**¿Las herramientas no aparecen?**
1. Abre `/cockpit` → panel "HERALD Tool Library" → clic en "Bootstrap"
2. O llama: `POST /api/herald/init`

**¿El semáforo está rojo?**
- La herramienta tuvo errores recientes. Revisa los logs de Vercel.
- El quality score se recupera automáticamente cuando vuelva a funcionar.

**¿`vibe_nodes` no existe?**
- Ejecuta `apps/control-room/src/lib/herald-schema.sql` en Supabase Studio.

**¿El vector search no funciona?**
- Requiere extensión `pgvector` en Supabase. Actívala en: Database → Extensions → habilitar `vector`.
- Si no está disponible, HERALD usa búsqueda por palabras clave como fallback automático.

---

## 📐 Diagrama de Arquitectura

```
AGENTE SYNTHIA™
     │
     │ "Quiero publicar en Instagram"
     ▼
┌─────────────────────────────────────┐
│         HERALD Router               │
│   1. Búsqueda vectorial (pgvector)  │
│   2. Fallback: coincidencia keyword │
│   3. Ordenar por quality_score      │
└─────────────┬───────────────────────┘
              │ tool_id: "postiz-instagram-post"
              ▼
┌─────────────────────────────────────┐
│      HERALD Executor                │
│   CLI: postiz post instagram        │
│       --caption "..." --media "..." │
└─────────────┬───────────────────────┘
              │
              ▼
         ✅ Post publicado
         ✎ quality_score: +0.05
```

---

## 🌐 Español al grano

**¿Qué es HERALD en una oración?**
> HERALD es el cerebro organizador que conecta a los agentes de SYNTHIA™ con todas las herramientas digitales disponibles, de forma inteligente y económica.

**¿Qué debo hacer yo como usuaria?**
> Básicamente nada. HERALD se actualiza solo. Si quieres forzar una actualización de herramientas, ve al Cockpit y presiona el botón "Bootstrap".

**¿Cuánto cuesta HERALD?**
> El almacenamiento en Supabase es parte del plan gratuito. Las búsquedas vectoriales usan pgvector (gratis). El costo real es en las herramientas que ejecuta — cada herramienta tiene su propio costo. HERALD no agrega costos extra.

---

*Documentación viva — actualizada con cada sprint*
*© Kupuri Media™ 2026*
