---
name: OpenFang Agent OS
description: Autonomous agent operating system. Gives every Synthia agent access to 7 pre-built Hands (Clip, Lead, Collector, Predictor, Researcher, Twitter, Browser), 53 built-in tools, and 40 messaging channel adapters including WhatsApp and Telegram for the Ivette approval loop.
color: orange
tools: Bash, WebFetch, Read, Write
---

# OpenFang — Agent Operating System Skill

**Source**: https://github.com/RightNow-AI/openfang
**Integration**: `src/lib/openfang.ts` + `/api/openfang`
**Status**: Hardwired skill — available to ALL Synthia agents
**Daemon**: `openfang start` → http://localhost:4200

---

## ¿Qué es OpenFang?

OpenFang es un sistema operativo de agentes autónomos escrito en Rust. Se ejecuta como un daemon de 32MB con arranque en 180ms que expone 140+ endpoints REST/WebSocket/SSE. **No es un chatbot framework** — es infraestructura de agentes que opera 24/7 sin esperar prompts humanos.

**Diferenciador clave para KUPURI**: Los agentes Synthia razonan y planifican. OpenFang ejecuta acciones reales en el mundo: descarga videos, posta en redes sociales, envía WhatsApp a Ivette, descubre leads, monitorea la competencia.

---

## Las 7 Manos (Hands) → Mapeo de Agentes Synthia

| OpenFang Hand | Agente Synthia Primario | Lo que Añade al Stack |
|---------------|------------------------|----------------------|
| **Clip** | Fany TikTok | YouTube → short vertical + subtítulos automáticos + voz en off. Producción de video real. |
| **Lead** | Clandestino | Descubrimiento diario de prospectos con scoring ICP. Leads calificados cada mañana. |
| **Collector** | Morpho | Monitoreo OSINT con detección de cambios y grafos de conocimiento. Inteligencia competitiva real. |
| **Predictor** | Council + Morpho | Motor de superforecasting calibrado. Decisiones estratégicas basadas en probabilidades reales. |
| **Researcher** | Todos los agentes | Investigación profunda con evaluación de credibilidad de fuentes. Sin alucinaciones. |
| **Twitter/Social** | fany sub-agents | Posteo autónomo con approval gates obligatorios → Ivette aprueba antes de publicar. |
| **Browser** | Indigo | Automatización web: scraping de competidores, captura de leads, compras con approval gate. |

---

## Loop de Aprobación con Ivette (Crítico)

Los 40 adaptadores de canales resuelven el problema de "la IA no puede contactar a Ivette directamente". Con OpenFang:

```bash
# Clandestino encontró un lead calificado → alerta inmediata a Ivette
POST /api/openfang
{
  "mode": "send_channel",
  "platform": "whatsapp",
  "to": "+521XXXXXXXXXX",
  "message": "🔔 Lead calificado detectado:\nEmpresa: Acme Corp\nICP Score: 92/100\nContacto: María García, CEO\nResponde SÍ para iniciar secuencia o NO para descartar."
}

# fany quiere postear → Ivette debe aprobar primero
POST /api/openfang
{
  "mode": "send_channel",
  "platform": "telegram",
  "to": "@ivette_handle",
  "message": "✅ Approval requerido para TikTok:\nContenido: 'Cómo una PyME triplicó su ROI en 3 meses'\nPublicación programada: hoy 18:00 hrs\nResponde APROBAR o RECHAZAR"
}
```

**Plataformas disponibles**: whatsapp, telegram, discord, slack, email, signal, matrix, teams, y 32 más.

---

## Cómo Usar OpenFang (Protocolo para Agentes)

### 1. Verificar Estado del Daemon

```bash
# Antes de cualquier operación, verificar que OpenFang está corriendo
curl http://localhost:3000/api/openfang

# Si no está corriendo, la respuesta incluye el comando de instalación:
# { "installed": false, "installCommand": "curl -fsSL https://openfang.sh/install | sh && openfang init && openfang start" }
```

### 2. Desplegar una Mano

```bash
# Desplegar Lead Hand para Clandestino con schedule matutino
curl -X POST http://localhost:3000/api/openfang \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "deploy_hand",
    "handType": "lead",
    "name": "Clandestino Lead Scanner",
    "schedule": "0 9 * * 1-5",
    "params": {
      "icp": {
        "industry": ["marketing", "agencias", "e-commerce"],
        "size": "10-200 empleados",
        "region": "México, LATAM",
        "budget": "5000-50000 USD/mes"
      }
    }
  }'
```

### 3. Disparar una Mano Manualmente

```bash
# Clandestino dispara el Lead Hand con contexto adicional
curl -X POST http://localhost:3000/api/openfang \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "trigger",
    "handId": "lead-hand-abc123",
    "input": {
      "keywords": ["automatización marketing", "agencia digital"],
      "maxResults": 20
    }
  }'
```

### 4. Consultar Memoria del Agente

```bash
# Morpho consulta qué cambios detectó la semana pasada sobre un competidor
curl -X POST http://localhost:3000/api/openfang \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "query_memory",
    "agentId": "collector-morpho",
    "query": "cambios en pricing de competidores la semana pasada",
    "topK": 5
  }'
```

---

## Instalación y Configuración

### Setup Inicial (una vez)

```bash
# 1. Instalar OpenFang daemon
curl -fsSL https://openfang.sh/install | sh

# 2. Inicializar configuración (LLM keys, etc.)
openfang init

# 3. Iniciar el daemon
openfang start
# Dashboard en http://localhost:4200

# 4. Agregar variables de entorno al .env.local
echo "OPENFANG_BASE_URL=http://localhost:4200" >> .env.local
echo "OPENFANG_API_KEY=tu_api_key_aqui" >> .env.local
```

### Producción (Docker)

```yaml
# docker-compose.yml — agregar junto al control-room
services:
  openfang:
    image: openfang/openfang:latest
    ports:
      - "4200:4200"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - MINIMAX_API_KEY=${MINIMAX_API_KEY}
    volumes:
      - openfang_data:/data
```

```bash
# En producción, usar URL interna del contenedor
OPENFANG_BASE_URL=http://openfang:4200
```

---

## Variables de Entorno Requeridas

```bash
# .env.local
OPENFANG_BASE_URL=http://localhost:4200     # URL del daemon (o URL interna Docker)
OPENFANG_API_KEY=your_openfang_api_key      # API key del daemon (opcional en desarrollo local)
```

---

## Stack Técnico de OpenFang

- **Lenguaje**: Rust (14 crates, 137,728 líneas)
- **Runtime**: WASM sandbox con fuel metering
- **Persistencia**: SQLite + vector embeddings
- **Desktop**: Tauri 2.0 (app nativa cross-platform)
- **Seguridad**: 16 capas — WASM sandbox, Merkle hash-chain, Ed25519, SSRF protection, prompt injection scanning
- **LLM Providers**: 27 providers, 123+ modelos (Claude, Gemini, MiniMax, Groq, Ollama, etc.)
- **Tests**: 1,767+ tests pasando, cero warnings de Clippy
- **Versión**: 0.3.30 (MIT + Apache 2.0)

---

## Notas para Agentes

1. **Siempre verificar estado** antes de intentar operaciones (`GET /api/openfang`)
2. **No bloquear el thread** — usar `triggerHand` y retornar al usuario, el Hand corre en background
3. **Approval gates son obligatorios** para: posts en redes sociales, compras, emails a clientes — siempre pasar por Ivette vía WhatsApp/Telegram
4. **El daemon puede no estar corriendo** — la lib tiene fallback graceful que retorna `{ running: false }` sin crashes
5. **Scheduling autónomo** — los Hands pueden correr solos en schedule, no necesitan que el agente los dispare cada vez
