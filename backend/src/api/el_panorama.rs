//! EL PANORAMA™ — Agent Orchestration Layer
//! Restaurant & Bar El Panorama — Puerto Vallarta, MX (est. 1973)
//! 360° view. Tableside service. You sit back. The spheres work.
//!
//! GTD (David Allen) + PMBOK 7th Edition baked into every heartbeat.
//! ZTE Protocol v2.0 — autonomous execution with circuit breakers.
//! Emerald Tablets™ — the dominant law. UDEC ≥ 8.5 to ship.

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use chrono::Utc;
use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::{Arc, Mutex};
use uuid::Uuid;

use crate::api::routes::AppState;

// ═══════════════════════════════════════════════════
// DB HELPER — get a connection from shared state
// ═══════════════════════════════════════════════════

pub type SharedDb = Arc<Mutex<Connection>>;

fn ts() -> String {
    Utc::now().to_rfc3339()
}

fn new_id() -> String {
    Uuid::new_v4().to_string()
}

// ═══════════════════════════════════════════════════
// CIRCUIT BREAKER CONSTANTS
// ═══════════════════════════════════════════════════

const COST_GUARD_TOKENS: i64 = 10_000; // ~$10 at typical rates
const COST_GUARD_DAILY_USD: f64 = 50.0;
const LOOP_GUARD_MAX_RETRIES: i64 = 3;

fn circuit_breaker_response(breaker: &str, message: &str) -> Json<Value> {
    Json(json!({
        "status": "CIRCUIT_BREAKER",
        "breaker": breaker,
        "message": message,
        "accion": "HALT — aguardar autorización de Bambu/Ivette",
        "timestamp": ts()
    }))
}

// ═══════════════════════════════════════════════════
// HEARTBEAT — The GTD+PMBOK Agent Operating Loop
// POST /el-panorama/latido
// ═══════════════════════════════════════════════════

#[derive(Debug, Deserialize)]
pub struct LatidoRequest {
    pub esfera_id: String,
    pub run_id: String,
    pub razon_despertar: Option<String>,
    pub mision_id: Option<String>,
    pub aprobacion_id: Option<String>,
    pub costo_tokens: Option<i64>,
    pub costo_usd: Option<f64>,
}

pub async fn ep_latido(
    State(state): State<AppState>,
    Json(req): Json<LatidoRequest>,
) -> Json<Value> {
    // ── CIRCUIT BREAKER: Cost Guard ──────────────────
    if let Some(tokens) = req.costo_tokens {
        if tokens > COST_GUARD_TOKENS {
            return circuit_breaker_response(
                "COST_GUARD",
                &format!("Run usó {} tokens (>${} est.). Límite: {} tokens.",
                    tokens, tokens / 1000, COST_GUARD_TOKENS),
            );
        }
    }

    let now = ts();
    let latido_id = new_id();

    // ── Log heartbeat to SQLite ──────────────────────
    if let Ok(db) = state.db.lock() {
        let _ = db.execute(
            "INSERT OR REPLACE INTO ep_latidos
             (id, esfera_id, run_id, razon_despertar, mision_id,
              tokens_gastados, costo_usd_est, estado, creado_en)
             VALUES (?1,?2,?3,?4,?5,?6,?7,'completado',?8)",
            params![
                latido_id,
                req.esfera_id,
                req.run_id,
                req.razon_despertar.as_deref().unwrap_or("schedule"),
                req.mision_id.as_deref(),
                req.costo_tokens.unwrap_or(0),
                req.costo_usd.unwrap_or(0.0),
                now
            ],
        );

        // Update esfera last-seen
        let _ = db.execute(
            "UPDATE ep_esferas SET latido_en=?1, estado='activa', actualizado_en=?1 WHERE id=?2",
            params![now, req.esfera_id],
        );
    }

    // ── GTD Work Queue: find next missions ───────────
    let misiones_asignadas = get_esfera_queue(&state, &req.esfera_id);

    // ── Build GTD instructions ───────────────────────
    Json(json!({
        "status": "latido_recibido",
        "esfera_id": req.esfera_id,
        "run_id": req.run_id,
        "latido_id": latido_id,
        "timestamp": now,

        // GTD Protocol — 5 Steps
        "protocolo": "GTD_PMBOK_v1",
        "pasos_gtd": {
            "1_capturar": "Registrar todo en la Bandeja. Nada queda en memoria.",
            "2_clarificar": "¿Es accionable? < 2 min → hacer ahora. > 2 min → planificar.",
            "3_organizar": "Bandeja | Próximo | En Ronda | Esperando | Algún Día | Listo",
            "4_reflexionar": "Si es lunes 6am → ejecutar revisión semanal completa.",
            "5_ejecutar": "Trabajar en orden: en_ronda > proximo > esperando"
        },

        // PMBOK reminder
        "principio_pmbok": "Entrega VALOR (resultado), no solo output (código funcionando).",

        // Actual work queue
        "cola_trabajo": misiones_asignadas,

        // Specific mission if triggered
        "mision_prioritaria": req.mision_id,
    }))
}

fn get_esfera_queue(state: &AppState, esfera_id: &str) -> Value {
    if let Ok(db) = state.db.lock() {
        let mut stmt = db.prepare(
            "SELECT id, titulo, estado, prioridad, proximo_paso
             FROM ep_misiones
             WHERE asignada_a = ?1
               AND estado IN ('en_ronda','proximo','esperando')
             ORDER BY
               CASE estado
                 WHEN 'en_ronda'  THEN 1
                 WHEN 'proximo'   THEN 2
                 WHEN 'esperando' THEN 3
               END,
               CASE prioridad
                 WHEN 'urgente' THEN 1
                 WHEN 'alta'    THEN 2
                 WHEN 'media'   THEN 3
                 WHEN 'baja'    THEN 4
               END
             LIMIT 5"
        ).unwrap_or_else(|_| panic!("SQL prepare failed"));

        let misiones: Vec<Value> = stmt.query_map(params![esfera_id], |row| {
            Ok(json!({
                "id": row.get::<_, String>(0)?,
                "titulo": row.get::<_, String>(1)?,
                "estado": row.get::<_, String>(2)?,
                "prioridad": row.get::<_, String>(3)?,
                "proximo_paso": row.get::<_, Option<String>>(4)?
            }))
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

        json!(misiones)
    } else {
        json!([])
    }
}

// ═══════════════════════════════════════════════════
// LA VISTA — 360° Dashboard
// GET /el-panorama/la-vista
// ═══════════════════════════════════════════════════

pub async fn ep_la_vista(State(state): State<AppState>) -> Json<Value> {
    let now = ts();

    // Aggregate counts from SQLite
    let (esferas, misiones_por_estado, mesas, presupuesto) = if let Ok(db) = state.db.lock() {
        let esferas: Vec<Value> = db.prepare(
            "SELECT id, nombre, rol, color, estado, tokens_usados, latido_en FROM ep_esferas"
        )
        .and_then(|mut s| {
            s.query_map([], |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "nombre": r.get::<_,String>(1)?,
                "rol": r.get::<_,String>(2)?,
                "color": r.get::<_,String>(3)?,
                "estado": r.get::<_,String>(4)?,
                "tokens_usados": r.get::<_,i64>(5)?,
                "latido_en": r.get::<_,Option<String>>(6)?
            })))
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_default();

        let count_by_estado = |estado: &str| -> i64 {
            db.query_row(
                "SELECT COUNT(*) FROM ep_misiones WHERE estado=?1",
                params![estado],
                |r| r.get(0),
            ).unwrap_or(0)
        };

        let misiones_por_estado = json!({
            "bandeja":   count_by_estado("bandeja"),
            "proximo":   count_by_estado("proximo"),
            "en_ronda":  count_by_estado("en_ronda"),
            "esperando": count_by_estado("esperando"),
            "algún_día": count_by_estado("algún_día"),
            "listo":     count_by_estado("listo"),
        });

        let mesas: Vec<Value> = db.prepare(
            "SELECT id, nombre, horizonte, nicho, estado, tokens_usados FROM ep_mesas"
        )
        .and_then(|mut s| {
            s.query_map([], |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "nombre": r.get::<_,String>(1)?,
                "horizonte": r.get::<_,String>(2)?,
                "nicho": r.get::<_,Option<String>>(3)?,
                "estado": r.get::<_,String>(4)?,
                "tokens_usados": r.get::<_,i64>(5)?
            })))
            .map(|rows| rows.filter_map(|r| r.ok()).collect())
        })
        .unwrap_or_default();

        let tokens_hoy: i64 = db.query_row(
            "SELECT COALESCE(SUM(tokens_gastados),0) FROM ep_latidos
             WHERE date(creado_en)=date('now')",
            [], |r| r.get(0)
        ).unwrap_or(0);

        let presupuesto = json!({
            "tokens_hoy": tokens_hoy,
            "costo_usd_hoy": (tokens_hoy as f64) / 1_000_000.0 * 15.0,
            "limite_dia_tokens": 50_000,
            "limite_dia_usd": COST_GUARD_DAILY_USD,
            "estado": if (tokens_hoy as f64) / 1_000_000.0 * 15.0 > COST_GUARD_DAILY_USD * 0.8
                { "alerta" } else { "ok" }
        });

        (esferas, misiones_por_estado, mesas, presupuesto)
    } else {
        (vec![], json!({}), vec![], json!({}))
    };

    Json(json!({
        "timestamp": now,
        "vista": "El Panorama™ — 360° Bay of Banderas",
        "esferas": esferas,
        "misiones": misiones_por_estado,
        "mesas": mesas,
        "presupuesto": presupuesto,
    }))
}

// ═══════════════════════════════════════════════════
// VOZ — Voice Command Entry Point
// POST /el-panorama/voz
// ═══════════════════════════════════════════════════

#[derive(Debug, Deserialize)]
pub struct VozRequest {
    pub transcripcion: String,
    pub idioma: Option<String>,
    pub usuario_id: String,
    pub mesa_id: Option<String>,
}

pub async fn ep_voz(
    State(state): State<AppState>,
    Json(req): Json<VozRequest>,
) -> Json<Value> {
    let idioma = req.idioma.unwrap_or_else(|| "es".to_string());
    let intent = classify_voice_intent(&req.transcripcion);
    let esferas = suggest_esferas(&intent);

    // Auto-create expedición + first misión
    let exp_id = new_id();
    let mision_id = new_id();
    let now = ts();

    let titulo_exp = format!("VOZ: {}", &req.transcripcion.chars().take(60).collect::<String>());
    let proximo_paso = format!("Investigar: {}", &req.transcripcion.chars().take(80).collect::<String>());

    if let Ok(db) = state.db.lock() {
        let _ = db.execute(
            "INSERT INTO ep_expediciones (id,nombre,descripcion,mesa_id,estado,creado_en,actualizado_en)
             VALUES (?1,?2,?3,?4,'activa',?5,?5)",
            params![exp_id, titulo_exp, req.transcripcion, req.mesa_id.as_deref(), now],
        );

        let _ = db.execute(
            "INSERT INTO ep_misiones
             (id,titulo,descripcion,mesa_id,expedicion_id,estado,prioridad,
              proximo_paso,tokens_usados,creado_en,actualizado_en)
             VALUES (?1,?2,?3,?4,?5,'proximo','alta',?6,0,?7,?7)",
            params![
                mision_id, titulo_exp, req.transcripcion,
                req.mesa_id.as_deref(), exp_id, proximo_paso, now
            ],
        );
    }

    Json(json!({
        "status": "recibido",
        "transcripcion": req.transcripcion,
        "idioma": idioma,
        "intent": intent,
        "expedicion_creada": exp_id,
        "mision_creada": mision_id,
        "esferas_asignadas": esferas,
        "tiempo_estimado": "24 horas para sitios completos",
        "mensaje": "El Panorama™ ha tomado tu voz. Los esferas están trabajando.",
        "timestamp": now
    }))
}

fn classify_voice_intent(text: &str) -> Value {
    let lower = text.to_lowercase();

    let tipo = if lower.contains("busca") || lower.contains("scrape") || lower.contains("find") || lower.contains("investiga") {
        "investigacion"
    } else if lower.contains("crea") || lower.contains("build") || lower.contains("construye") || lower.contains("diseña") {
        "construccion"
    } else if lower.contains("despliega") || lower.contains("deploy") || lower.contains("lanza") || lower.contains("publica") {
        "despliegue"
    } else if lower.contains("audita") || lower.contains("revisa") || lower.contains("check") || lower.contains("analiza") {
        "auditoria"
    } else if lower.contains("whatsapp") || lower.contains("contacta") || lower.contains("envía") {
        "outreach"
    } else {
        "general"
    };

    let nicho = if lower.contains("vegan") || lower.contains("vegano") || lower.contains("plant") {
        "gastronomia_vegana"
    } else if lower.contains("eco") || lower.contains("tour") || lower.contains("travel") || lower.contains("viaje") {
        "eco_turismo"
    } else if lower.contains("salud") || lower.contains("wellness") || lower.contains("health") || lower.contains("yoga") {
        "salud_bienestar"
    } else if lower.contains("restaurante") || lower.contains("restaurant") || lower.contains("comida") || lower.contains("food") {
        "gastronomia"
    } else {
        "negocio_general"
    };

    json!({ "tipo": tipo, "nicho": nicho })
}

fn suggest_esferas(intent: &Value) -> Vec<&'static str> {
    match intent["tipo"].as_str().unwrap_or("general") {
        "investigacion" => vec!["research-esfera"],
        "construccion"  => vec!["darya-design", "synthia-prime"],
        "despliegue"    => vec!["deploy-esfera"],
        "auditoria"     => vec!["darya-design", "research-esfera"],
        "outreach"      => vec!["synthia-prime"],
        _               => vec!["synthia-prime"],
    }
}

// ═══════════════════════════════════════════════════
// MESAS — Client Ecosystems
// ═══════════════════════════════════════════════════

pub async fn ep_list_mesas(State(state): State<AppState>) -> Json<Value> {
    let mesas = if let Ok(db) = state.db.lock() {
        db.prepare("SELECT id,nombre,horizonte,nicho,estado,presupuesto_mensual,tokens_usados,creado_en FROM ep_mesas ORDER BY creado_en DESC")
            .and_then(|mut s| s.query_map([], |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "nombre": r.get::<_,String>(1)?,
                "horizonte": r.get::<_,String>(2)?,
                "nicho": r.get::<_,Option<String>>(3)?,
                "estado": r.get::<_,String>(4)?,
                "presupuesto_mensual": r.get::<_,i64>(5)?,
                "tokens_usados": r.get::<_,i64>(6)?,
                "creado_en": r.get::<_,String>(7)?
            }))).map(|rows| rows.filter_map(|r| r.ok()).collect()))
            .unwrap_or_default()
    } else { vec![] };

    Json(json!({ "mesas": mesas, "total": mesas.len(), "timestamp": ts() }))
}

#[derive(Debug, Deserialize)]
pub struct CreateMesaRequest {
    pub nombre: String,
    pub horizonte: String,
    pub nicho: Option<String>,
    pub presupuesto_mensual: Option<i64>,
}

pub async fn ep_create_mesa(
    State(state): State<AppState>,
    Json(req): Json<CreateMesaRequest>,
) -> Json<Value> {
    let id = new_id();
    let now = ts();
    if let Ok(db) = state.db.lock() {
        let _ = db.execute(
            "INSERT INTO ep_mesas (id,nombre,horizonte,nicho,presupuesto_mensual,tokens_usados,estado,metadata,creado_en,actualizado_en)
             VALUES (?1,?2,?3,?4,?5,0,'activa','{}',?6,?6)",
            params![id, req.nombre, req.horizonte, req.nicho.as_deref(), req.presupuesto_mensual.unwrap_or(100_000), now],
        );
    }
    Json(json!({ "id": id, "nombre": req.nombre, "horizonte": req.horizonte, "creado_en": now }))
}

pub async fn ep_get_mesa(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    if let Ok(db) = state.db.lock() {
        if let Ok(row) = db.query_row(
            "SELECT id,nombre,horizonte,nicho,estado,presupuesto_mensual,tokens_usados,creado_en FROM ep_mesas WHERE id=?1",
            params![id],
            |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "nombre": r.get::<_,String>(1)?,
                "horizonte": r.get::<_,String>(2)?,
                "nicho": r.get::<_,Option<String>>(3)?,
                "estado": r.get::<_,String>(4)?,
                "presupuesto_mensual": r.get::<_,i64>(5)?,
                "tokens_usados": r.get::<_,i64>(6)?,
                "creado_en": r.get::<_,String>(7)?
            }))
        ) {
            return (StatusCode::OK, Json(row));
        }
    }
    (StatusCode::NOT_FOUND, Json(json!({ "error": "Mesa no encontrada", "id": id })))
}

// ═══════════════════════════════════════════════════
// ESFERAS — Agent Spheres
// ═══════════════════════════════════════════════════

pub async fn ep_list_esferas(State(state): State<AppState>) -> Json<Value> {
    let esferas = if let Ok(db) = state.db.lock() {
        db.prepare("SELECT id,nombre,rol,color,estado,presupuesto_tokens,tokens_usados,latido_en,adapter_tipo,reporta_a FROM ep_esferas ORDER BY creado_en")
            .and_then(|mut s| s.query_map([], |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "nombre": r.get::<_,String>(1)?,
                "rol": r.get::<_,String>(2)?,
                "color": r.get::<_,String>(3)?,
                "estado": r.get::<_,String>(4)?,
                "presupuesto_tokens": r.get::<_,i64>(5)?,
                "tokens_usados": r.get::<_,i64>(6)?,
                "latido_en": r.get::<_,Option<String>>(7)?,
                "adapter_tipo": r.get::<_,String>(8)?,
                "reporta_a": r.get::<_,Option<String>>(9)?
            }))).map(|rows| rows.filter_map(|r| r.ok()).collect()))
            .unwrap_or_default()
    } else { vec![] };

    Json(json!({ "esferas": esferas, "total": esferas.len() }))
}

#[derive(Debug, Deserialize)]
pub struct RegisterEsferaRequest {
    pub nombre: String,
    pub rol: String,
    pub color: Option<String>,
    pub mesa_id: Option<String>,
    pub presupuesto_tokens: Option<i64>,
    pub adapter_tipo: Option<String>,
    pub habilidades: Option<Vec<String>>,
    pub reporta_a: Option<String>,
}

pub async fn ep_register_esfera(
    State(state): State<AppState>,
    Json(req): Json<RegisterEsferaRequest>,
) -> Json<Value> {
    let id = new_id();
    let now = ts();
    let habilidades = serde_json::to_string(&req.habilidades.unwrap_or_default()).unwrap_or_default();

    if let Ok(db) = state.db.lock() {
        let _ = db.execute(
            "INSERT OR IGNORE INTO ep_esferas
             (id,nombre,rol,mesa_id,color,estado,presupuesto_tokens,tokens_usados,
              adapter_tipo,adapter_config,habilidades,reporta_a,creado_en,actualizado_en)
             VALUES (?1,?2,?3,?4,?5,'activa',?6,0,?7,'{}',?8,?9,?10,?10)",
            params![
                id, req.nombre, req.rol, req.mesa_id.as_deref(),
                req.color.as_deref().unwrap_or("#4a8a6a"),
                req.presupuesto_tokens.unwrap_or(50_000),
                req.adapter_tipo.as_deref().unwrap_or("claude_local"),
                habilidades, req.reporta_a.as_deref(), now
            ],
        );
    }
    Json(json!({ "id": id, "nombre": req.nombre, "creado_en": now }))
}

pub async fn ep_esfera_me(State(_state): State<AppState>) -> Json<Value> {
    Json(json!({
        "id": "synthia-prime",
        "nombre": "SYNTHIA™ Prime",
        "rol": "Directora de Inteligencia",
        "estado": "activa"
    }))
}

pub async fn ep_get_esfera(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    if let Ok(db) = state.db.lock() {
        if let Ok(row) = db.query_row(
            "SELECT id,nombre,rol,color,estado,presupuesto_tokens,tokens_usados,latido_en FROM ep_esferas WHERE id=?1",
            params![id],
            |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "nombre": r.get::<_,String>(1)?,
                "rol": r.get::<_,String>(2)?,
                "color": r.get::<_,String>(3)?,
                "estado": r.get::<_,String>(4)?,
                "presupuesto_tokens": r.get::<_,i64>(5)?,
                "tokens_usados": r.get::<_,i64>(6)?,
                "latido_en": r.get::<_,Option<String>>(7)?
            }))
        ) {
            return (StatusCode::OK, Json(row));
        }
    }
    (StatusCode::NOT_FOUND, Json(json!({ "error": "Esfera no encontrada" })))
}

pub async fn ep_esfera_heartbeat(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(_body): Json<Value>,
) -> Json<Value> {
    let now = ts();
    if let Ok(db) = state.db.lock() {
        let _ = db.execute(
            "UPDATE ep_esferas SET latido_en=?1, actualizado_en=?1 WHERE id=?2",
            params![now, id],
        );
    }
    Json(json!({ "esfera_id": id, "latido": "registrado", "timestamp": now }))
}

// ═══════════════════════════════════════════════════
// MISIONES — Tasks (GTD-powered)
// ═══════════════════════════════════════════════════

#[derive(Debug, Deserialize, Default)]
pub struct MisionFilter {
    pub estado: Option<String>,
    pub mesa_id: Option<String>,
    pub asignada_a: Option<String>,
    pub expedicion_id: Option<String>,
}

pub async fn ep_list_misiones(
    State(state): State<AppState>,
    Query(filter): Query<MisionFilter>,
) -> Json<Value> {
    let misiones = if let Ok(db) = state.db.lock() {
        let mut sql = "SELECT id,titulo,estado,prioridad,asignada_a,proximo_paso,
                              mesa_id,expedicion_id,tokens_usados,creado_en
                       FROM ep_misiones WHERE 1=1".to_string();
        let mut values: Vec<String> = vec![];

        if let Some(ref e) = filter.estado {
            sql.push_str(&format!(" AND estado='{}'", e));
        }
        if let Some(ref m) = filter.mesa_id {
            sql.push_str(&format!(" AND mesa_id='{}'", m));
        }
        if let Some(ref a) = filter.asignada_a {
            sql.push_str(&format!(" AND asignada_a='{}'", a));
        }
        sql.push_str(" ORDER BY CASE estado WHEN 'en_ronda' THEN 1 WHEN 'proximo' THEN 2 ELSE 3 END, CASE prioridad WHEN 'urgente' THEN 1 WHEN 'alta' THEN 2 WHEN 'media' THEN 3 ELSE 4 END LIMIT 100");

        db.prepare(&sql)
            .and_then(|mut s| {
                s.query_map([], |r| Ok(json!({
                    "id": r.get::<_,String>(0)?,
                    "titulo": r.get::<_,String>(1)?,
                    "estado": r.get::<_,String>(2)?,
                    "prioridad": r.get::<_,String>(3)?,
                    "asignada_a": r.get::<_,Option<String>>(4)?,
                    "proximo_paso": r.get::<_,Option<String>>(5)?,
                    "mesa_id": r.get::<_,Option<String>>(6)?,
                    "expedicion_id": r.get::<_,Option<String>>(7)?,
                    "tokens_usados": r.get::<_,i64>(8)?,
                    "creado_en": r.get::<_,String>(9)?
                })))
                .map(|rows| rows.filter_map(|r| r.ok()).collect())
            })
            .unwrap_or_default()
    } else { vec![] };

    let total = misiones.len();
    Json(json!({ "misiones": misiones, "total": total, "timestamp": ts() }))
}

#[derive(Debug, Deserialize)]
pub struct CreateMisionRequest {
    pub titulo: String,
    pub descripcion: Option<String>,
    pub mesa_id: Option<String>,
    pub expedicion_id: Option<String>,
    pub horizonte_id: Option<String>,
    pub asignada_a: Option<String>,
    pub prioridad: Option<String>,
    pub proximo_paso: Option<String>,
}

pub async fn ep_create_mision(
    State(state): State<AppState>,
    Json(req): Json<CreateMisionRequest>,
) -> Json<Value> {
    let proximo_paso = req.proximo_paso.clone().unwrap_or_else(|| {
        "CLARIFICAR: ¿Cuál es el siguiente paso físico y concreto?".to_string()
    });

    let id = new_id();
    let now = ts();

    if let Ok(db) = state.db.lock() {
        let _ = db.execute(
            "INSERT INTO ep_misiones
             (id,titulo,descripcion,mesa_id,expedicion_id,horizonte_id,
              asignada_a,estado,prioridad,proximo_paso,tokens_usados,creado_en,actualizado_en)
             VALUES (?1,?2,?3,?4,?5,?6,?7,'bandeja',?8,?9,0,?10,?10)",
            params![
                id, req.titulo, req.descripcion.as_deref(),
                req.mesa_id.as_deref(), req.expedicion_id.as_deref(),
                req.horizonte_id.as_deref(), req.asignada_a.as_deref(),
                req.prioridad.as_deref().unwrap_or("media"),
                proximo_paso, now
            ],
        );
    }

    Json(json!({
        "id": id,
        "titulo": req.titulo,
        "estado": "bandeja",
        "proximo_paso": proximo_paso,
        "creado_en": now
    }))
}

pub async fn ep_get_mision(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    if let Ok(db) = state.db.lock() {
        if let Ok(row) = db.query_row(
            "SELECT id,titulo,descripcion,estado,prioridad,asignada_a,proximo_paso,
                    mesa_id,expedicion_id,tokens_usados,completada_en,creado_en,actualizado_en
             FROM ep_misiones WHERE id=?1",
            params![id],
            |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "titulo": r.get::<_,String>(1)?,
                "descripcion": r.get::<_,Option<String>>(2)?,
                "estado": r.get::<_,String>(3)?,
                "prioridad": r.get::<_,String>(4)?,
                "asignada_a": r.get::<_,Option<String>>(5)?,
                "proximo_paso": r.get::<_,Option<String>>(6)?,
                "mesa_id": r.get::<_,Option<String>>(7)?,
                "expedicion_id": r.get::<_,Option<String>>(8)?,
                "tokens_usados": r.get::<_,i64>(9)?,
                "completada_en": r.get::<_,Option<String>>(10)?,
                "creado_en": r.get::<_,String>(11)?,
                "actualizado_en": r.get::<_,String>(12)?
            }))
        ) {
            return (StatusCode::OK, Json(row));
        }
    }
    (StatusCode::NOT_FOUND, Json(json!({ "error": "Misión no encontrada" })))
}

#[derive(Debug, Deserialize)]
pub struct UpdateMisionRequest {
    pub estado: Option<String>,
    pub proximo_paso: Option<String>,
    pub asignada_a: Option<String>,
    pub tokens_usados: Option<i64>,
    pub udec_score: Option<f64>,
    pub descripcion: Option<String>,
}

pub async fn ep_update_mision(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<UpdateMisionRequest>,
) -> impl IntoResponse {
    let now = ts();
    if let Ok(db) = state.db.lock() {
        if req.estado.as_deref() == Some("listo") {
            if let Some(score) = req.udec_score {
                if score < 8.5 {
                    return (StatusCode::UNPROCESSABLE_ENTITY, Json(json!({
                        "error": "UDEC_GATE",
                        "message": format!("UDEC score {:.1} < 8.5. Calidad insuficiente para completar.", score),
                        "required": 8.5,
                        "actual": score
                    })));
                }
            }
        }

        let completada_en = if req.estado.as_deref() == Some("listo") { Some(now.clone()) } else { None };

        let _ = db.execute(
            "UPDATE ep_misiones SET
               estado=COALESCE(?1,estado),
               proximo_paso=COALESCE(?2,proximo_paso),
               asignada_a=COALESCE(?3,asignada_a),
               tokens_usados=COALESCE(?4,tokens_usados),
               udec_score=COALESCE(?5,udec_score),
               completada_en=COALESCE(?6,completada_en),
               actualizado_en=?7
             WHERE id=?8",
            params![
                req.estado.as_deref(), req.proximo_paso.as_deref(),
                req.asignada_a.as_deref(), req.tokens_usados,
                req.udec_score, completada_en.as_deref(), now, id
            ],
        );
    }
    (StatusCode::OK, Json(json!({ "id": id, "actualizado": true, "timestamp": now })))
}

#[derive(Debug, Deserialize)]
pub struct ReservaRequest {
    pub esfera_id: String,
    pub run_id: String,
    pub estados_validos: Option<Vec<String>>,
}

pub async fn ep_reservar_mision(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<ReservaRequest>,
) -> impl IntoResponse {
    let now = ts();
    if let Ok(db) = state.db.lock() {
        let current: Option<(String, Option<String>)> = db.query_row(
            "SELECT estado, run_id_actual FROM ep_misiones WHERE id=?1",
            params![id],
            |r| Ok((r.get(0)?, r.get(1)?)),
        ).ok();

        match current {
            None => return (StatusCode::NOT_FOUND, Json(json!({ "error": "Misión no encontrada" }))),
            Some((_, Some(run_id))) if run_id != req.run_id => {
                return (StatusCode::CONFLICT, Json(json!({
                    "error": "RESERVA_CONFLICT",
                    "message": "Esta misión ya está reservada por otro agente.",
                    "run_id_actual": run_id
                })));
            }
            Some((estado, _)) => {
                let default_valid = vec!["bandeja".to_string(), "proximo".to_string()];
                let valid = req.estados_validos.as_ref().unwrap_or(&default_valid);
                if !valid.contains(&estado) {
                    return (StatusCode::UNPROCESSABLE_ENTITY, Json(json!({
                        "error": "ESTADO_INVALIDO",
                        "estado_actual": estado,
                        "estados_validos": valid
                    })));
                }
            }
        }

        let _ = db.execute(
            "UPDATE ep_misiones SET estado='en_ronda', run_id_actual=?1, asignada_a=?2, actualizado_en=?3 WHERE id=?4",
            params![req.run_id, req.esfera_id, now, id],
        );
    }

    (StatusCode::OK, Json(json!({
        "mision_id": id,
        "esfera_id": req.esfera_id,
        "run_id": req.run_id,
        "estado": "en_ronda",
        "reservada_en": now
    })))
}

#[derive(Debug, Deserialize)]
pub struct ComentarioRequest {
    pub esfera_id: String,
    pub run_id: String,
    pub contenido: String,
    pub tipo: Option<String>,
    pub tokens_gastados: Option<i64>,
}

pub async fn ep_comentar_mision(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(req): Json<ComentarioRequest>,
) -> Json<Value> {
    let comment_id = new_id();
    let now = ts();
    if let Ok(db) = state.db.lock() {
        let _ = db.execute(
            "INSERT INTO ep_comentarios (id,mision_id,esfera_id,run_id,contenido,tipo,creado_en)
             VALUES (?1,?2,?3,?4,?5,?6,?7)",
            params![
                comment_id, id, req.esfera_id, req.run_id,
                req.contenido, req.tipo.as_deref().unwrap_or("progreso"), now
            ],
        );
        if let Some(tokens) = req.tokens_gastados {
            let _ = db.execute(
                "UPDATE ep_misiones SET tokens_usados=tokens_usados+?1, actualizado_en=?2 WHERE id=?3",
                params![tokens, now, id],
            );
        }
    }
    Json(json!({ "comentario_id": comment_id, "mision_id": id, "creado_en": now }))
}

// ═══════════════════════════════════════════════════
// EXPEDICIONES — Multi-step Projects
// ═══════════════════════════════════════════════════

pub async fn ep_list_expediciones(State(state): State<AppState>) -> Json<Value> {
    let exps = if let Ok(db) = state.db.lock() {
        db.prepare("SELECT id,nombre,descripcion,mesa_id,estado,udec_score,creado_en FROM ep_expediciones ORDER BY creado_en DESC LIMIT 50")
            .and_then(|mut s| s.query_map([], |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "nombre": r.get::<_,String>(1)?,
                "descripcion": r.get::<_,Option<String>>(2)?,
                "mesa_id": r.get::<_,Option<String>>(3)?,
                "estado": r.get::<_,String>(4)?,
                "udec_score": r.get::<_,Option<f64>>(5)?,
                "creado_en": r.get::<_,String>(6)?
            }))).map(|rows| rows.filter_map(|r| r.ok()).collect()))
            .unwrap_or_default()
    } else { vec![] };
    Json(json!({ "expediciones": exps, "total": exps.len() }))
}

#[derive(Debug, Deserialize)]
pub struct CreateExpedicionRequest {
    pub nombre: String,
    pub descripcion: Option<String>,
    pub mesa_id: Option<String>,
    pub horizonte_id: Option<String>,
}

pub async fn ep_create_expedicion(
    State(state): State<AppState>,
    Json(req): Json<CreateExpedicionRequest>,
) -> Json<Value> {
    let id = new_id();
    let now = ts();
    if let Ok(db) = state.db.lock() {
        let _ = db.execute(
            "INSERT INTO ep_expediciones (id,nombre,descripcion,mesa_id,horizonte_id,estado,creado_en,actualizado_en)
             VALUES (?1,?2,?3,?4,?5,'activa',?6,?6)",
            params![id, req.nombre, req.descripcion.as_deref(), req.mesa_id.as_deref(), req.horizonte_id.as_deref(), now],
        );
    }
    Json(json!({ "id": id, "nombre": req.nombre, "estado": "activa", "creado_en": now }))
}

pub async fn ep_get_expedicion(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> impl IntoResponse {
    if let Ok(db) = state.db.lock() {
        if let Ok(row) = db.query_row(
            "SELECT id,nombre,descripcion,mesa_id,estado,udec_score,creado_en FROM ep_expediciones WHERE id=?1",
            params![id],
            |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "nombre": r.get::<_,String>(1)?,
                "descripcion": r.get::<_,Option<String>>(2)?,
                "mesa_id": r.get::<_,Option<String>>(3)?,
                "estado": r.get::<_,String>(4)?,
                "udec_score": r.get::<_,Option<f64>>(5)?,
                "creado_en": r.get::<_,String>(6)?
            }))
        ) {
            return (StatusCode::OK, Json(row));
        }
    }
    (StatusCode::NOT_FOUND, Json(json!({ "error": "Expedición no encontrada" })))
}

// ═══════════════════════════════════════════════════
// HORIZONTES — Goals (always visible like the bay)
// ═══════════════════════════════════════════════════

pub async fn ep_list_horizontes(State(state): State<AppState>) -> Json<Value> {
    let hs = if let Ok(db) = state.db.lock() {
        db.prepare("SELECT id,titulo,descripcion,mesa_id,metrica_exito,fecha_objetivo,completado FROM ep_horizontes ORDER BY creado_en")
            .and_then(|mut s| s.query_map([], |r| Ok(json!({
                "id": r.get::<_,String>(0)?,
                "titulo": r.get::<_,String>(1)?,
                "descripcion": r.get::<_,String>(2)?,
                "mesa_id": r.get::<_,Option<String>>(3)?,
                "metrica_exito": r.get::<_,Option<String>>(4)?,
                "fecha_objetivo": r.get::<_,Option<String>>(5)?,
                "completado": r.get::<_,i64>(6)? == 1
            }))).map(|rows| rows.filter_map(|r| r.ok()).collect()))
            .unwrap_or_default()
    } else { vec![] };
    Json(json!({ "horizontes": hs, "total": hs.len() }))
}

#[derive(Debug, Deserialize)]
pub struct CreateHorizonteRequest {
    pub titulo: String,
    pub descripcion: String,
    pub mesa_id: Option<String>,
    pub metrica_exito: Option<String>,
    pub fecha_objetivo: Option<String>,
}

pub async fn ep_create_horizonte(
    State(state): State<AppState>,
    Json(req): Json<CreateHorizonteRequest>,
) -> Json<Value> {
    let id = new_id();
    let now = ts();
    if let Ok(db) = state.db.lock() {
        let _ = db.execute(
            "INSERT INTO ep_horizontes (id,titulo,descripcion,mesa_id,metrica_exito,fecha_objetivo,completado,creado_en)
             VALUES (?1,?2,?3,?4,?5,?6,0,?7)",
            params![id, req.titulo, req.descripcion, req.mesa_id.as_deref(), req.metrica_exito.as_deref(), req.fecha_objetivo.as_deref(), now],
        );
    }
    Json(json!({ "id": id, "titulo": req.titulo, "creado_en": now }))
}

// ═══════════════════════════════════════════════════
// CONSTELACIÓN — Org Chart (constellation of spheres)
// ═══════════════════════════════════════════════════

pub async fn ep_constelacion(State(state): State<AppState>) -> Json<Value> {
    let (nodos, conexiones) = if let Ok(db) = state.db.lock() {
        let mut stmt = match db.prepare("SELECT id,nombre,rol,color,estado,reporta_a FROM ep_esferas") {
            Ok(s) => s,
            Err(_) => return Json(json!({"nodos": [], "conexiones": [], "timestamp": ts()})),
        };

        let nodos: Vec<Value> = stmt.query_map([], |r| {
            let id: String = r.get(0)?;
            Ok(json!({
                "id": id,
                "nombre": r.get::<_,String>(1)?,
                "rol": r.get::<_,String>(2)?,
                "color": r.get::<_,String>(3)?,
                "estado": r.get::<_,String>(4)?,
                "reporta_a": r.get::<_,Option<String>>(5)?
            }))
        })
        .map(|rows| rows.filter_map(|r| r.ok()).collect())
        .unwrap_or_default();

        let conexiones: Vec<Value> = nodos.iter()
            .filter_map(|n| n["reporta_a"].as_str().map(|parent| json!({
                "from": n["id"].as_str().unwrap_or(""),
                "to": parent,
                "tipo": "reporta_a"
            })))
            .collect();

        (nodos, conexiones)
    } else { (vec![], vec![]) };

    Json(json!({
        "nodos": nodos,
        "conexiones": conexiones,
        "timestamp": ts()
    }))
}

// ═══════════════════════════════════════════════════
// PRESUPUESTO — Budget tracking
// ═══════════════════════════════════════════════════

pub async fn ep_presupuesto(State(state): State<AppState>) -> Json<Value> {
    if let Ok(db) = state.db.lock() {
        let tokens_hoy: i64 = db.query_row(
            "SELECT COALESCE(SUM(tokens_gastados),0) FROM ep_latidos WHERE date(creado_en)=date('now')",
            [], |r| r.get(0)
        ).unwrap_or(0);

        let tokens_mes: i64 = db.query_row(
            "SELECT COALESCE(SUM(tokens_gastados),0) FROM ep_latidos WHERE strftime('%Y-%m',creado_en)=strftime('%Y-%m','now')",
            [], |r| r.get(0)
        ).unwrap_or(0);

        let costo_hoy = (tokens_hoy as f64) / 1_000_000.0 * 15.0;
        let costo_mes = (tokens_mes as f64) / 1_000_000.0 * 15.0;

        let alerta = if costo_hoy > COST_GUARD_DAILY_USD * 0.8 { "crítico" }
                     else if costo_hoy > COST_GUARD_DAILY_USD * 0.6 { "alerta" }
                     else { "ok" };

        return Json(json!({
            "tokens_hoy": tokens_hoy,
            "tokens_mes": tokens_mes,
            "costo_usd_hoy": format!("{:.4}", costo_hoy),
            "costo_usd_mes": format!("{:.4}", costo_mes),
            "limite_dia_usd": COST_GUARD_DAILY_USD,
            "estado": alerta,
            "timestamp": ts()
        }));
    }
    Json(json!({ "error": "DB unavailable" }))
}

// ═══════════════════════════════════════════════════
// CONSEJO — Karpathy Council (multi-agent deliberation)
// POST /el-panorama/consejo
// ═══════════════════════════════════════════════════

#[derive(Debug, Deserialize)]
pub struct ConsejoRequest {
    pub pregunta: String,
    pub esferas_convocadas: Vec<String>,
    pub contexto: Option<String>,
    pub mesa_id: Option<String>,
}

pub async fn ep_council(
    State(_state): State<AppState>,
    Json(req): Json<ConsejoRequest>,
) -> Json<Value> {
    Json(json!({
        "consejo_id": new_id(),
        "pregunta": req.pregunta,
        "esferas_convocadas": req.esferas_convocadas,
        "contexto": req.contexto,
        "protocolo": "Karpathy™ — Posición → Réplica → Síntesis",
        "descripcion": "Las esferas se reúnen en la mesa central de El Panorama™. Sus Tescitos de Labrador™ pulsan dorado.",
        "rondas": [
            { "numero": 1, "nombre": "Posición", "estado": "pendiente",
              "instruccion": "Cada esfera declara su posición de forma independiente. Sin influencia de otras." },
            { "numero": 2, "nombre": "Réplica", "estado": "pendiente",
              "instruccion": "Cada esfera desafía la posición más débil encontrada. No consenso fácil." },
            { "numero": 3, "nombre": "Síntesis", "estado": "pendiente",
              "instruccion": "Decisión única, accionable, con el fundamento más sólido. No hay empate." }
        ],
        "decision": null,
        "iniciado_en": ts()
    }))
}
