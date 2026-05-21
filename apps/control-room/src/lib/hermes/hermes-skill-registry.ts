/**
 * Hermes Skill Registry — local catalogue of known skills.
 * Seeded from the Synthia 3.0 spec. Syncs with live Hermes on startup if configured.
 */

import { listSkills } from './hermes-client';
import type { HermesSkill } from './hermes-types';

const SEED_SKILLS: HermesSkill[] = [
  { id: 'web-search',       name: 'Búsqueda Web',         slug: 'web-search',       description: 'Busca información en internet en tiempo real.',           category: 'research',     risk_level: 'low',    enabled: true },
  { id: 'browser',          name: 'Navegador Web',         slug: 'browser',          description: 'Navega, extrae y analiza páginas web.',                   category: 'research',     risk_level: 'medium', enabled: true },
  { id: 'document-read',    name: 'Leer Documentos',       slug: 'document-read',    description: 'Lee y analiza PDFs, Word, Excel, y más.',                 category: 'data',         risk_level: 'low',    enabled: true },
  { id: 'image-gen',        name: 'Generar Imágenes',      slug: 'image-gen',        description: 'Crea imágenes con IA para campañas y presentaciones.',     category: 'media',        risk_level: 'low',    enabled: true },
  { id: 'video-gen',        name: 'Generar Video',         slug: 'video-gen',        description: 'Produce videos cortos con narración y B-roll.',            category: 'media',        risk_level: 'medium', enabled: true },
  { id: 'spreadsheet',      name: 'Hojas de Cálculo',      slug: 'spreadsheet',      description: 'Crea y analiza datos en tablas estructuradas.',            category: 'data',         risk_level: 'low',    enabled: true },
  { id: 'slides',           name: 'Presentaciones',        slug: 'slides',           description: 'Genera presentaciones ejecutivas automáticamente.',        category: 'interactive',  risk_level: 'low',    enabled: true },
  { id: 'code-exec',        name: 'Ejecutar Código',       slug: 'code-exec',        description: 'Corre scripts Python/JS en un entorno aislado.',           category: 'execution',    risk_level: 'high',   enabled: false },
  { id: 'shell',            name: 'Terminal',              slug: 'shell',            description: 'Ejecuta comandos de shell en VM aislada.',                 category: 'execution',    risk_level: 'critical', enabled: false },
  { id: 'email-send',       name: 'Enviar Correo',         slug: 'email-send',       description: 'Redacta y envía correos vía Gmail o SendGrid.',           category: 'interactive',  risk_level: 'medium', enabled: true },
  { id: 'whatsapp',         name: 'WhatsApp Business',     slug: 'whatsapp',         description: 'Envía mensajes y campañas de WhatsApp Business.',         category: 'interactive',  risk_level: 'medium', enabled: false },
  { id: 'calendar',         name: 'Google Calendar',       slug: 'calendar',         description: 'Lee y crea eventos en el calendario.',                     category: 'data',         risk_level: 'low',    enabled: true },
  { id: 'maps',             name: 'Google Maps',           slug: 'maps',             description: 'Analiza ubicaciones, rutas y negocios locales.',           category: 'research',     risk_level: 'low',    enabled: true },
  { id: 'transcribe',       name: 'Transcribir Audio',     slug: 'transcribe',       description: 'Convierte audio y video en texto.',                        category: 'media',        risk_level: 'low',    enabled: true },
  { id: 'avatar',           name: 'Avatar de Video',       slug: 'avatar',           description: 'Genera videos con presentador de IA.',                    category: 'media',        risk_level: 'medium', enabled: false },
];

let _cache: HermesSkill[] | null = null;
let _lastSync = 0;
const SYNC_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getSkills(forceRefresh = false): Promise<HermesSkill[]> {
  const now = Date.now();
  if (!forceRefresh && _cache && now - _lastSync < SYNC_TTL_MS) {
    return _cache;
  }

  try {
    const live = await listSkills();
    if (live.length > 0) {
      _cache = live;
      _lastSync = now;
      return _cache;
    }
  } catch {
    // Hermes not reachable — fall through to seed
  }

  _cache = SEED_SKILLS;
  return _cache;
}

export function getSkillById(id: string): HermesSkill | undefined {
  return (_cache ?? SEED_SKILLS).find(s => s.id === id || s.slug === id);
}

export function getSkillsByCategory(category: string): HermesSkill[] {
  return (_cache ?? SEED_SKILLS).filter(s => s.category === category);
}

export function getEnabledSkills(): HermesSkill[] {
  return (_cache ?? SEED_SKILLS).filter(s => s.enabled);
}
