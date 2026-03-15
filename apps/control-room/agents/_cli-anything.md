---
name: CLI-Anything
description: Universal creative software control skill. Gives every Synthia agent direct command-line control over GIMP, Blender, Inkscape, Kdenlive, Audacity, LibreOffice, OBS Studio, Draw.io, and more. Bridges the gap between AI reasoning and professional desktop application output.
color: green
tools: Bash, WebFetch, Read, Write
---

# CLI-Anything — Universal Creative Execution Skill

**Source**: https://github.com/HKUDS/CLI-Anything
**Integration**: `src/lib/cli-anything.ts` + `/api/cli`
**Status**: Hardwired skill — available to ALL Synthia agents

---

## ¿Qué es CLI-Anything?

CLI-Anything transforma cualquier aplicación de software profesional en una interfaz de línea de comandos controlable por agentes. En vez de hacer clic en botones, los agentes ejecutan comandos con salida JSON estructurada.

**Principio fundamental**: Los CLIs llaman al software REAL instalado en el sistema — no simulaciones. El output es auténtico: archivos ODF reales, XML de video real, SVGs reales.

---

## Software Disponible para Agentes

| Herramienta | CLI | Agentes Primarios | Casos de Uso KUPURI |
|-------------|-----|-------------------|---------------------|
| **GIMP** | `cli-anything-gimp` | Merlina, Lapina Instagram | Assets sociales, composición, optimización de imágenes |
| **Blender** | `cli-anything-blender` | Merlina, Indigo | Renders 3D de entregables, motion graphics para demos virales |
| **Inkscape** | `cli-anything-inkscape` | Merlina, Lapina LinkedIn | Carruseles vectoriales, infografías, iconografía de marca |
| **Kdenlive** | `cli-anything-kdenlive` | Lapina TikTok, Lapina Instagram | Edición de video, subtítulos automáticos, variantes A/B/C |
| **Audacity** | `cli-anything-audacity` | Lapina TikTok, Ivette Voice | Normalizar audio, limpiar ruido, añadir música |
| **LibreOffice** | `cli-anything-libreoffice` | Synthia, Morpho, Clandestino, Ralphy | Reportes, propuestas de cliente, decks de pitch, contratos |
| **OBS Studio** | `cli-anything-obs-studio` | Indigo, Synthia | Grabar demos virales, capturar reuniones del Council en vivo |
| **Draw.io** | `cli-anything-drawio` | Morpho, Ralphy | Diagramas de flujo de agentes, mapas de proceso para clientes |
| **AnyGen** | `cli-anything-anygen` | Synthia, Indigo, Lapina | Generación de presentaciones desde prompt natural |

---

## Cómo Usar CLI-Anything (Protocolo para Agentes)

### Método 1: API Interna (recomendado)

```
POST /api/cli
Content-Type: application/json

{
  "tool": "gimp",
  "command": ["canvas", "scale", "--width", "1080", "--height", "1920"]
}
```

### Método 2: Bash directo (cuando tienes acceso a terminal)

```bash
# Comando simple con JSON output
cli-anything-gimp --json project open /ruta/imagen.jpg

# Flujo completo de asset social
cli-anything-gimp --json project open /assets/foto-cliente.jpg
cli-anything-gimp --json canvas scale --width 1080 --height 1920
cli-anything-gimp --json export render /output/tiktok-asset.png --format png
```

### Método 3: Helpers de alto nivel

```
POST /api/cli
{
  "mode": "social_asset",
  "sourcePath": "/tmp/raw-photo.jpg",
  "outputPath": "/output/instagram-post.jpg",
  "platform": "instagram"
}
```

```
POST /api/cli
{
  "mode": "workflow",
  "steps": [
    { "tool": "kdenlive", "command": ["project", "open", "/raw/demo.mp4"] },
    { "tool": "kdenlive", "command": ["track", "add-text", "--text", "KUPURI MEDIA™", "--start", "0", "--end", "3"] },
    { "tool": "kdenlive", "command": ["export", "render", "/output/demo-branded.mp4", "--format", "mp4"] }
  ]
}
```

---

## Patrones de Uso por Agente

### Synthia Prime (CEO Digital)
```
Generar deck de propuesta para cliente:
POST /api/cli { mode: "workflow", steps: [
  { tool: "anygen", command: ["task", "run", "--operation", "slide", "--prompt", "..."] },
  { tool: "libreoffice", command: ["export", "render", "propuesta.pdf", "--format", "pdf"] }
]}
```

### Lapina TikTok
```
Crear video con subtítulos y música:
POST /api/cli { mode: "captions", inputVideo: "raw.mp4", outputVideo: "tiktok-final.mp4",
  captions: [{ text: "¿Sabías que...", startSec: 0, endSec: 3 }]
}
```

### Lapina Instagram / LinkedIn
```
Redimensionar asset a spec de plataforma:
POST /api/cli { mode: "social_asset", sourcePath: "foto.jpg",
  outputPath: "instagram.jpg", platform: "instagram"
}
```

### Merlina (Creative Director)
```
Crear infografía vectorial:
cli-anything-inkscape project new --profile "a4-landscape"
cli-anything-inkscape shape add rect --x 0 --y 0 --w 800 --h 100 --fill "#FF2D7F"
cli-anything-inkscape text add "KUPURI MEDIA™" --x 20 --y 70 --size 48 --color white
cli-anything-inkscape export render infografia.svg
cli-anything-inkscape export render infografia.pdf --format pdf
```

### Morpho (Analytics)
```
Exportar reporte de métricas:
POST /api/cli { mode: "report", title: "Reporte Mensual KUPURI",
  data: [{metric: "leads", value: 24}, ...], outputDir: "/reports/2026-03"
}
```

### Ralphy (Coach)
```
Generar diagrama de flujo de coaching:
cli-anything-drawio project new
cli-anything-drawio node add --label "Scan" --shape rounded
cli-anything-drawio edge add --from "Scan" --to "Classify"
cli-anything-drawio export render coaching-flow.png
```

### Indigo (Growth)
```
Grabar demo viral con OBS:
cli-anything-obs-studio project new --name "demo-kupuri-ia"
cli-anything-obs-studio scene add --name "Demo Principal"
cli-anything-obs-studio source add screen-capture --name "Synthia Screen"
cli-anything-obs-studio output recording --format mp4 --output /demos/viral-demo-1.mp4
```

---

## Descubrir Herramientas Instaladas

```
GET /api/cli
```

Responde con lista de tools, cuáles están instaladas, y cómo instalar las que faltan.

---

## Instalación de Tools (Contexto del Sistema)

```bash
# Instalar todos los CLIs de una vez
pip install \
  cli-anything-gimp \
  cli-anything-blender \
  cli-anything-inkscape \
  cli-anything-kdenlive \
  cli-anything-audacity \
  cli-anything-libreoffice \
  cli-anything-obs-studio \
  cli-anything-drawio \
  cli-anything-anygen

# También necesitas el software real instalado:
sudo apt install gimp blender inkscape kdenlive audacity libreoffice obs-studio
```

---

## Principios de Token Efficiency

Los agentes deben usar CLI-Anything de forma eficiente:

1. **Batch operations**: Agrupar pasos en un workflow en lugar de llamadas individuales
2. **JSON output siempre**: Parsear el JSON para decidir el siguiente paso
3. **Helpers de alto nivel primero**: `social_asset`, `captions`, `report` antes que comandos individuales
4. **Cachear proyectos**: Guardar el `projectFile` para reutilizar en pasos posteriores
5. **Verificar instalación**: Checar con `GET /api/cli?tool=<tool>` antes de asumir que está disponible

---

## Flujo de Producción de Contenido con CLI-Anything

```
Indigo genera brief
     ↓
Lapina distribuye a sub-agentes
     ↓
Lapina TikTok    → Kdenlive (video) + Audacity (audio)
Lapina Instagram → GIMP (imagen) + Inkscape (diseño)
Lapina LinkedIn  → LibreOffice (documento) + Inkscape (carrusel)
     ↓
Merlina valida calidad visual
     ↓
Ralphy hace QA final con Lightning Protocol
     ↓
Synthia aprueba y programa publicación
     ↓
Morpho trackea métricas 48h
     ↓
Ganador A/B → Synthia escala
```

---

*CLI-Anything Skill | Hardwired para todos los agentes | KUPURI MEDIA™ / Synthia 3.0*
