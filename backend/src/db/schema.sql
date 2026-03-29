-- ═══════════════════════════════════════════════════
-- EL PANORAMA™ DATABASE SCHEMA
-- SQLite via rusqlite bundled
-- Applied automatically on every startup (idempotent)
-- Kupuri Media™ × Akash Engine × Emerald Tablets™
-- ═══════════════════════════════════════════════════

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- ── Client Ecosystems (Mesa = table at El Panorama restaurant) ──
CREATE TABLE IF NOT EXISTS ep_mesas (
    id              TEXT PRIMARY KEY,
    nombre          TEXT NOT NULL,
    horizonte       TEXT NOT NULL,         -- company goal / north star
    presupuesto_mensual INTEGER DEFAULT 100000,
    tokens_usados   INTEGER DEFAULT 0,
    nicho           TEXT,                  -- travel|vegan|wellness|general
    estado          TEXT DEFAULT 'activa' CHECK(estado IN ('activa','pausada','archivada')),
    metadata        TEXT DEFAULT '{}',     -- JSON blob for extra fields
    creado_en       TEXT NOT NULL,
    actualizado_en  TEXT NOT NULL
);

-- ── Agent Spheres (Esfera = sphere hovering at restaurant table) ──
CREATE TABLE IF NOT EXISTS ep_esferas (
    id                  TEXT PRIMARY KEY,
    nombre              TEXT NOT NULL,
    rol                 TEXT NOT NULL,
    mesa_id             TEXT REFERENCES ep_mesas(id) ON DELETE SET NULL,
    color               TEXT DEFAULT '#4a8a6a',
    estado              TEXT DEFAULT 'activa'
                          CHECK(estado IN ('activa','descansando','trabajando','bloqueada','offline')),
    presupuesto_tokens  INTEGER DEFAULT 50000,
    tokens_usados       INTEGER DEFAULT 0,
    latido_en           TEXT,
    adapter_tipo        TEXT DEFAULT 'claude_local'
                          CHECK(adapter_tipo IN ('claude_local','http','rust','bash')),
    adapter_config      TEXT DEFAULT '{}',  -- JSON
    habilidades         TEXT DEFAULT '[]',  -- JSON array of skill IDs
    reporta_a           TEXT REFERENCES ep_esferas(id) ON DELETE SET NULL,
    creado_en           TEXT NOT NULL,
    actualizado_en      TEXT NOT NULL
);

-- ── Goals (Horizonte = horizon — always visible like the bay) ──
CREATE TABLE IF NOT EXISTS ep_horizontes (
    id              TEXT PRIMARY KEY,
    titulo          TEXT NOT NULL,
    descripcion     TEXT NOT NULL,
    mesa_id         TEXT REFERENCES ep_mesas(id) ON DELETE CASCADE,
    metrica_exito   TEXT,
    fecha_objetivo  TEXT,
    completado      INTEGER DEFAULT 0,
    creado_en       TEXT NOT NULL
);

-- ── Projects (Expedición = expedition into new territory) ──
CREATE TABLE IF NOT EXISTS ep_expediciones (
    id              TEXT PRIMARY KEY,
    nombre          TEXT NOT NULL,
    descripcion     TEXT,
    mesa_id         TEXT REFERENCES ep_mesas(id) ON DELETE CASCADE,
    horizonte_id    TEXT REFERENCES ep_horizontes(id) ON DELETE SET NULL,
    estado          TEXT DEFAULT 'activa'
                      CHECK(estado IN ('activa','pausada','completa','archivada')),
    udec_score      REAL,                  -- must be >= 8.5 to deploy frontend
    creado_en       TEXT NOT NULL,
    actualizado_en  TEXT NOT NULL
);

-- ── Tasks (Misión = mission — each has a defined next action) ──
CREATE TABLE IF NOT EXISTS ep_misiones (
    id              TEXT PRIMARY KEY,
    titulo          TEXT NOT NULL,
    descripcion     TEXT,
    mesa_id         TEXT REFERENCES ep_mesas(id) ON DELETE CASCADE,
    expedicion_id   TEXT REFERENCES ep_expediciones(id) ON DELETE SET NULL,
    horizonte_id    TEXT REFERENCES ep_horizontes(id) ON DELETE SET NULL,
    asignada_a      TEXT REFERENCES ep_esferas(id) ON DELETE SET NULL,
    estado          TEXT DEFAULT 'bandeja'
                      CHECK(estado IN ('bandeja','proximo','en_ronda','esperando','algún_día','listo')),
    prioridad       TEXT DEFAULT 'media'
                      CHECK(prioridad IN ('urgente','alta','media','baja')),
    proximo_paso    TEXT,                  -- GTD LAW: must always be defined
    tokens_usados   INTEGER DEFAULT 0,
    run_id_actual   TEXT,                  -- atomic checkout: which run owns this
    udec_score      REAL,                  -- quality score when done
    completada_en   TEXT,
    creado_en       TEXT NOT NULL,
    actualizado_en  TEXT NOT NULL
);

-- ── Comments / Progress logs ──
CREATE TABLE IF NOT EXISTS ep_comentarios (
    id          TEXT PRIMARY KEY,
    mision_id   TEXT NOT NULL REFERENCES ep_misiones(id) ON DELETE CASCADE,
    esfera_id   TEXT NOT NULL REFERENCES ep_esferas(id) ON DELETE CASCADE,
    run_id      TEXT NOT NULL,
    contenido   TEXT NOT NULL,
    tipo        TEXT DEFAULT 'progreso'
                  CHECK(tipo IN ('progreso','bloqueo','completado','nota')),
    creado_en   TEXT NOT NULL
);

-- ── Heartbeat log (latido = heartbeat — evidence the system is alive) ──
CREATE TABLE IF NOT EXISTS ep_latidos (
    id              TEXT PRIMARY KEY,
    esfera_id       TEXT NOT NULL REFERENCES ep_esferas(id) ON DELETE CASCADE,
    run_id          TEXT NOT NULL,
    razon_despertar TEXT,
    mision_id       TEXT,
    tokens_gastados INTEGER DEFAULT 0,
    costo_usd_est   REAL DEFAULT 0.0,
    estado          TEXT DEFAULT 'completado',
    creado_en       TEXT NOT NULL
);

-- ── HERALD Tool registry (MCP → CLI wrappers) ──
CREATE TABLE IF NOT EXISTS ep_herramientas (
    id              TEXT PRIMARY KEY,
    tool_id         TEXT UNIQUE NOT NULL,
    tool_name       TEXT NOT NULL,
    executor_kind   TEXT NOT NULL,
    executor_config TEXT DEFAULT '{}',  -- JSON
    capabilities    TEXT DEFAULT '[]',  -- JSON array
    cli_signature   TEXT NOT NULL,
    auth_required   INTEGER DEFAULT 0,
    auth_env_key    TEXT,
    quality_score   REAL DEFAULT 0.5,
    usage_count     INTEGER DEFAULT 0,
    health_status   TEXT DEFAULT 'unknown',
    registrado_en   TEXT NOT NULL,
    actualizado_en  TEXT NOT NULL
);

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_misiones_estado     ON ep_misiones(estado);
CREATE INDEX IF NOT EXISTS idx_misiones_asignada   ON ep_misiones(asignada_a);
CREATE INDEX IF NOT EXISTS idx_misiones_mesa       ON ep_misiones(mesa_id);
CREATE INDEX IF NOT EXISTS idx_misiones_expedicion ON ep_misiones(expedicion_id);
CREATE INDEX IF NOT EXISTS idx_esferas_mesa        ON ep_esferas(mesa_id);
CREATE INDEX IF NOT EXISTS idx_latidos_esfera      ON ep_latidos(esfera_id);
CREATE INDEX IF NOT EXISTS idx_latidos_created     ON ep_latidos(creado_en);
CREATE INDEX IF NOT EXISTS idx_herramientas_kind   ON ep_herramientas(executor_kind);

-- ════════════════════════════════════════════
-- SEED DATA — Default ecosystem on first boot
-- ════════════════════════════════════════════

INSERT OR IGNORE INTO ep_mesas VALUES (
    'kupuri-media-mesa',
    'Kupuri Media™',
    'Empoderar mujeres empresarias en LATAM con IA autónoma',
    500000, 0, 'agencia_digital', 'activa', '{}',
    datetime('now'), datetime('now')
);

INSERT OR IGNORE INTO ep_mesas VALUES (
    'akash-engine-mesa',
    'Akash Engine',
    'Client services $2.5K-$50K retainers — autonomous delivery',
    1000000, 0, 'cliente_servicios', 'activa', '{}',
    datetime('now'), datetime('now')
);

INSERT OR IGNORE INTO ep_esferas VALUES (
    'synthia-prime',
    'SYNTHIA™ Prime',
    'Directora de Inteligencia — Head Chef',
    'kupuri-media-mesa',
    '#c8a04a', 'activa', 200000, 0, null,
    'claude_local', '{}',
    '["el-panorama","master-frontend-design","zte-autodeploy","zté-protocol"]',
    null, datetime('now'), datetime('now')
);

INSERT OR IGNORE INTO ep_esferas VALUES (
    'darya-design',
    'Darya — Diseño',
    'Agente de Diseño Frontend — Awwwards quality',
    'kupuri-media-mesa',
    '#8a4a7a', 'activa', 50000, 0, null,
    'claude_local', '{}',
    '["master-frontend-design","uncodixfy","impeccable","udec-audit"]',
    'synthia-prime', datetime('now'), datetime('now')
);

INSERT OR IGNORE INTO ep_esferas VALUES (
    'research-esfera',
    'Investigadora',
    'Agente de Investigación + Datos + Scraping',
    'kupuri-media-mesa',
    '#4a6a8a', 'activa', 30000, 0, null,
    'claude_local', '{}',
    '["brightdata","google-maps","happycow","awwwards-scraper"]',
    'synthia-prime', datetime('now'), datetime('now')
);

INSERT OR IGNORE INTO ep_esferas VALUES (
    'deploy-esfera',
    'Desplegadora',
    'Agente de Deploy — Vercel + Cloudflare Pages',
    'kupuri-media-mesa',
    '#4a8a5a', 'activa', 20000, 0, null,
    'claude_local', '{}',
    '["vercel","cloudflare","coolify","infisical"]',
    'synthia-prime', datetime('now'), datetime('now')
);
