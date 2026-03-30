# ALEX™ KNOWLEDGE BASE
## Lo que ALEX™ sabe antes de que le preguntes

**Fuentes:** Agent Zero LATAM Framework + PopeBot Cluster Architecture + CDMX Local Intelligence
**Actualización:** Continua — cada tarea completada actualiza este archivo vía `bd create`

---

## CONOCIMIENTO LOCAL — SANTA MARÍA LA RIBERA, CDMX

### Horarios de la Colonia (Ivette necesita saber esto)

| Qué | Dónde | Horario |
|-----|-------|---------|
| Mercado Ribera | Eje 1 Norte esq. Manuel Carpio | Lun-Sáb 6am-6pm, Dom 6am-3pm |
| Fonditas de comida | Manuel Carpio y alrededores | Lun-Sáb 8am-5pm |
| Kiosco Morisco | Alameda Central de la Ribera | Todo el día, música Sáb-Dom |
| Tianguis Alameda | Alameda, frente al kiosco | Domingos 8am-3pm |
| Museo Geología UNAM | Dr. Enrique González Martínez 1 | Mar-Dom 10am-5pm |
| Museo del Chopo | Dr. Enrique González Martínez 10 | Mar-Dom 11am-7pm |
| Metro San Cosme | Av. Ribera de San Cosme | 5am-12am (lun-vie), 6am-12am (fin de semana) |
| Metro Buenavista | Av. Insurgentes | 5am-12am |

### Trámites y servicios en la zona

- **Notarías:** 3 en la colonia, la más antigua en Salvador Díaz Mirón esquina Manuel Carpio
- **SAT:** El más cercano es el de Nonoalco o insurgentes Norte
- **Banco:** BBVA, Santander, Banamex — todos en el eje comercial de Salvador Díaz Mirón
- **Correos de México:** Sucursal Buenavista, a 10 min caminando
- **IMSS Clínica:** Dr. Vértiz, 15 min en combi

---

## CONOCIMIENTO TÉCNICO — CLUSTER ARCHITECTURE (Stephen Pope / PopeBot)

### Cómo funciona el modo cluster de PopeBot

Basado en la arquitectura de `stephengpope/thepopebot` v1.2.73:

```
Cluster Master
     │
     ├── Worker 1 (agent-task execution)
     ├── Worker 2 (agent-task execution)
     ├── Worker 3 (webhook listener)
     └── Worker N (file watcher / cron)
```

**Inicio:** `npx thepopebot@latest init`

**3 modos de operación:**
1. **Headless** — sin UI, solo ejecuta tareas en background
2. **Interactive** — con interfaz para que Ivette vea qué está haciendo
3. **Cluster** — múltiples procesos paralelos, asignados por tareas

**Triggers disponibles:**
- `webhook` — recibe POST desde cualquier servicio externo
- `cron` — horarios programados (daily brief, weekly planning)  
- `file-watch` — detecta cambios en carpetas (e.g., nuevos archivos de clientes)
- `manual` — Ivette manda un mensaje y ALEX™ actúa

**Variables de entorno críticas:**
```bash
CLAUDE_API_KEY=      # Para tasks complejas con Claude
ANTHROPIC_API_KEY=   # Mismo key, diferente formato
MERCURY_API_KEY=     # Para tasks rápidas con Mercury 2
POPEBOT_CLUSTER=true # Activa modo multi-worker
POPEBOT_WORKERS=4    # Número de workers paralelos
```

---

## CONOCIMIENTO DE PROCESO — AGENT ZERO LATAM FRAMEWORK

Basado en el documento "Building a Future-Proof Autonomous AI Agent Platform"
**Adaptado para:** Latinoamérica + Emprendedoras + Español-primero

### BFF Architecture (Backend-For-Frontend)

ALEX™ opera desde el BFF — el cerebro y guardián:

```
Frontend (Next.js) → BFF (/api/alex, /api/council, etc.) → Modelos AI + Herramientas externas
```

El BFF garantiza:
1. **Vault de secretos** — ninguna API key expuesta al cliente
2. **Contexto invisible** — inyecta el perfil de negocio de Ivette en cada llamada
3. **Orquestación** — encadena agentes sin que el frontend haga múltiples viajes
4. **Traducción de protocolo** — normaliza respuestas de APIs externas

### Stack Tech LATAM-Optimizado

| Capa | Tecnología | Por qué es buena para LATAM |
|------|-----------|----------------------------|
| Frontend | Next.js + Shadcn | SSR — funciona bien con conexiones lentas |
| BFF | Next.js API routes | Sin servidor adicional para empezar |
| DB | Supabase/Postgres | Open-source, self-hostable, gratis al inicio |
| AI | Mercury 2 + Claude | Mercury 2 para velocidad, Claude para profundidad |
| Voz | ElevenLabs + PersonaPlex | Español nativo, baja latencia |
| Pagos | Stripe + PayPal + Crypto | Los tres métodos más usados en LATAM |
| Hosting dev | Vercel | Gratis, rápido, global CDN |
| Hosting prod | Coolify en Hostinger VPS | Controlado, barato (~$7 USD/mes) |

### Lead Generation Automático (Adaptado para México/LATAM)

El framework Agent Zero describe scraping de leads para directorios (Puerto Vallarta, CDMX). ALEX™ aplica esto para:

1. **Hoteles y restaurantes** en zonas turísticas (Polanco, Condesa, Roma, Santa Fe, Cancún, PV)
2. **Contactos B2B** — directores de marketing, dueños de PyMES, emprendedoras
3. **Oportunidades de freelance** — proyectos en Upwork/Workana donde se necesita español
4. **Comunidades LATAM** — foros, grupos de Facebook, WhatsApp groups de emprendedoras

---

## CONOCIMIENTO FINANCIERO — ARBITRAJE DE DIVISAS

### La Ecuación del Arbitraje

```
Trabajar en USD / EUR → Vivir en MXN = Ventaja real

Ejemplo (Marzo 2026):
- Proyecto freelance en Upwork: $150 USD
- En pesos mexicanos: ~$2,850 MXN
- Costo de vida promedio CDMX por día: ~$250-400 MXN
- Ingreso en $150 USD = 7-11 días de vida cubiertos
```

### Países y paridades clave para el arbitraje LATAM

| País | Moneda | Tipo de cambio vs USD (aprox) | Ventaja |
|------|--------|------------------------------|---------|
| México | MXN | ~19:1 | ⭐⭐⭐⭐ Muy favorable |
| Argentina | ARS | Variable (oficial vs blue) | ⭐⭐⭐⭐⭐ Extremo |
| Colombia | COP | ~4,000:1 | ⭐⭐⭐⭐ Muy favorable |
| Guatemala | GTQ | ~7.7:1 | ⭐⭐⭐ Favorable |
| Perú | PEN | ~3.7:1 | ⭐⭐⭐ Favorable |
| Chile | CLP | ~950:1 | ⭐⭐⭐ Favorable |

**Estrategia del Arbitrage Scout:**
1. Busca proyectos bien pagados en USD en Upwork/Fiverr (herramientas de IA, contenido en inglés, automatización)
2. Ejecuta desde México (costo de vida bajo)
3. Cobra en USD vía Stripe/PayPal → transfiere a cuenta MXN
4. Documenta para ISR (declarar correctamente evita problemas)

### Impuestos para freelancers en México (básico)
- **Régimen Simplificado de Confianza (RESICO):** Para ingresos hasta ~3.5M MXN/año
- **ISR:** 1-2.5% sobre ingresos totales bajo RESICO
- **IVA:** 16%, pero hay exenciones para servicios digitales de exportación (facturar a clientes extranjeros)
- **Consejo ALEX™:** Facturas a clientes españoles/americanos en USD son exportación de servicios, aplican tasa 0% IVA

---

## CONOCIMIENTO DE AGENTES — LOS 120 DE AGENCY-AGENTS

Agency-agents (`msitarzewski/agency-agents`) organiza 120 agentes en 12 divisiones:

| División | Agentes | Función |
|----------|---------|---------|
| Marketing | ~10 | SEO, social, email, publicidad |
| Sales | ~10 | Lead scoring, follow-up, CRM |
| Content | ~10 | Blog, copywriting, video scripts |
| Engineering | ~10 | Code review, debugging, docs |
| Research | ~10 | Web scraping, market research |
| Finance | ~10 | Presupuestos, análisis, reportes |
| Legal | ~5 | Contratos, términos, compliance |
| HR | ~5 | Onboarding, políticas, entrevistas |
| Ops | ~10 | Procesos, flujos, automatización |
| Design | ~10 | Prompts para herramientas de diseño |
| Customer Success | ~10 | Soporte, FAQs, seguimiento |
| OpenClaw (merged) | ~20 | Herramientas CLI especializadas |

**OpenClaw integrado:** 51 herramientas CLI de marketing en `apps/control-room/openclaw-logic/`

---

## CONOCIMIENTO MCP — mcp2cli TOKEN SAVINGS

`mcp2cli` convierte servidores MCP y APIs OpenAPI en comandos CLI:
- **96-99% de ahorro de tokens** comparado con llamar herramientas directamente
- En lugar de pasar todo el contexto de un servidor MCP, llama solo el comando relevante
- Compatible con todos los agents del stack

```bash
# Instalación
pip install mcp2cli

# Uso
mcp2cli --server supabase -- db query "SELECT * FROM users LIMIT 10"
mcp2cli --openapi stripe.yaml -- create-payment-intent amount=5000 currency=usd
```

---

## CONOCIMIENTO DE DESPLIEGUE — COOLIFY + HOSTINGER

El stack de producción completo vive en:
- **VPS Hostinger:** desde ~$7 USD/mes (plan básico suficiente para empezar)
- **Coolify:** panel de despliegue open-source, como Heroku pero self-hosted
- **Docker Compose:** todo containerizado
- **Dominio:** configurado en el DNS de Hostinger

```bash
# Deploy completo con Coolify
1. git push origin main
2. Coolify detecta el push (webhook)
3. Coolify hace docker build
4. Coolify reemplaza el contenedor
5. Health check en /api/health
6. ALEX™ notifica a Ivette vía agent-mail que el deploy fue exitoso
```

---

## CONOCIMIENTO DE VOZ — ELEVENLABS PARA CDMX

### Mejores voces ElevenLabs para español CDMX (research)

El acento chilango tiene características específicas:
- Velocidad de habla media-alta vs otros hispanohablantes
- Entonación ascendente característica en preguntas
- Uso de "¿verdad?", "¿no?", "¿sí?" al final de frases
- Diminutivos frecuentes: "ahorita", "chiquito", "nomás"
- Pronombres: "ustedes" (no "vosotros"), "acá" (no "aquí" formal)

**Configuración recomendada para ElevenLabs:**
```json
{
  "stability": 0.55,
  "similarity_boost": 0.85,
  "style": 0.45,
  "speed": 1.05
}
```

---

## CONOCIMIENTO DE BLOG — TEMAS QUE GENERAN TRÁFICO

Temas SEO validados para el blog de Kupuri Media / ALEX™:

1. **"Cómo automatizar tu negocio con IA en 2026" (español, LATAM)** — alto volumen
2. **"La primera empleada de IA para emprendedoras mexicanas"** — bajo competencia
3. **"Ganar dólares desde México: la guía del arbitraje de divisas"** — muy buscado
4. **"Santa María la Ribera: la colonia más creativa de CDMX"** — hiperlocal
5. **"Mujeres y IA: cómo recuperar 20 horas a la semana"** — emocional, muy compartible
6. **"Cómo usar Upwork desde México y ganar bien"** — práctico, alto valor
7. **"Facturar a clientes extranjeros desde México: guía legal"** — evergreen
8. **"ALEX™ vs asistente virtual humano: ¿qué conviene más?"** — awareness

---

## SELF-IMPROVEMENT LOG

ALEX™ actualiza este archivo automáticamente:

```
[2026-03-11] Inicialización v3.0 — Loaded Santa María la Ribera knowledge
[2026-03-11] Integración ZTE Protocol — Circuit breakers activos
[2026-03-11] Mercury 2 config — Primary model para chat interactivo
[2026-03-11] ElevenLabs + PersonaPlex — Voice stack configurado
[2026-03-11] Income automation — Stripe + PayPal + Crypto modules creados
```
