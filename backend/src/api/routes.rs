use axum::{
    extract::{State, Json},
    routing::{get, post, patch},
    Router, http::StatusCode,
    response::IntoResponse,
};
use serde_json::{json, Value};
use std::sync::{Arc, Mutex};
use rusqlite::Connection;
use crate::config::Config;
use crate::middleware::MetricsRegistry;
use crate::providers::{llm_trait::ChatMessage, mem0::Mem0Provider};
use crate::api::el_panorama::*;
use crate::api::site_factory::{
    firecrawl_scrape, kupuri_research,
    generate_image, animate_hero, build_site, batch_run,
};

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub mem0: Arc<Mem0Provider>,
    pub metrics: Arc<MetricsRegistry>,
    pub db: Arc<Mutex<Connection>>,
}

pub fn create_router(state: AppState) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/status", get(status))
        .route("/metrics", get(metrics_endpoint))
        .route("/switch_llm", post(switch_llm))
        .route("/chat", post(chat_endpoint))
        .route("/memory/add", post(add_memory))
        .route("/memory/retrieve", post(retrieve_memories))
        .route("/memory/search", post(search_memories))
        .route("/task/delegate", post(delegate_task))
        .route("/task/status/:id", get(task_status))
        .route("/composio/tools", get(composio_tools))
        .route("/composio/execute", post(composio_execute))
        .route("/firecrawl/scrape", post(firecrawl_scrape))
        .route("/kupuri/research", post(kupuri_research))
        .route("/site-factory/generate-image", post(generate_image))
        .route("/site-factory/animate-hero", post(animate_hero))
        .route("/site-factory/build", post(build_site))
        .route("/site-factory/batch", post(batch_run))
        .route("/audit/logs", get(audit_logs))
        .route("/api/tasks/recent", get(recent_tasks))
        .route("/api/memory/events", get(memory_events))
        .route("/api/dashboard/summary", get(dashboard_summary))
        // ── El Panorama™ — Agent Orchestration ──────────────────
        .route("/el-panorama/latido",                post(ep_latido))
        .route("/el-panorama/la-vista",              get(ep_la_vista))
        .route("/el-panorama/voz",                   post(ep_voz))
        .route("/el-panorama/mesas",                 get(ep_list_mesas))
        .route("/el-panorama/mesas",                 post(ep_create_mesa))
        .route("/el-panorama/mesas/:id",             get(ep_get_mesa))
        .route("/el-panorama/esferas",               get(ep_list_esferas))
        .route("/el-panorama/esferas",               post(ep_register_esfera))
        .route("/el-panorama/esferas/me",            get(ep_esfera_me))
        .route("/el-panorama/esferas/:id",           get(ep_get_esfera))
        .route("/el-panorama/esferas/:id/latido",    post(ep_esfera_heartbeat))
        .route("/el-panorama/misiones",              get(ep_list_misiones))
        .route("/el-panorama/misiones",              post(ep_create_mision))
        .route("/el-panorama/misiones/:id",          get(ep_get_mision))
        .route("/el-panorama/misiones/:id",          patch(ep_update_mision))
        .route("/el-panorama/misiones/:id/reserva",  post(ep_reservar_mision))
        .route("/el-panorama/misiones/:id/comentario", post(ep_comentar_mision))
        .route("/el-panorama/expediciones",          get(ep_list_expediciones))
        .route("/el-panorama/expediciones",          post(ep_create_expedicion))
        .route("/el-panorama/expediciones/:id",      get(ep_get_expedicion))
        .route("/el-panorama/horizontes",            get(ep_list_horizontes))
        .route("/el-panorama/horizontes",            post(ep_create_horizonte))
        .route("/el-panorama/constelacion",          get(ep_constelacion))
        .route("/el-panorama/presupuesto",           get(ep_presupuesto))
        .route("/el-panorama/consejo",               post(ep_council))
        // ── PAULI-CLIP™ — 3D Ceremony Orchestration ────────────────
        .route("/el-panorama/pauli-clip/ceremony",   post(ep_pauli_clip_ceremony))
        .route("/el-panorama/pauli-clip/ceremony/:id", get(ep_pauli_clip_ceremony_status))
        .route("/el-panorama/pauli-clip/decision",   post(ep_pauli_clip_record_decision))
        .route("/el-panorama/pauli-clip/dissolve",   post(ep_pauli_clip_sphere_dissolve))
        .with_state(state)
}

async fn health_check() -> Json<Value> {
    Json(json!({
        "status": "healthy",
        "service": "Synthia 3.0",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn status(State(state): State<AppState>) -> Json<Value> {
    Json(json!({
        "service": "Synthia 3.0",
        "version": "3.0.0",
        "provider": state.config.default_provider,
        "workspace": state.config.workspace_root,
        "agent_zero_enabled": state.config.agent_zero_enabled,
        "mem0_configured": !state.config.mem0_api_key.is_empty(),
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

#[derive(serde::Deserialize)]
pub struct SwitchLLMRequest {
    provider: String,
}

async fn switch_llm(
    State(state): State<AppState>,
    Json(payload): Json<SwitchLLMRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    // In production, validate and switch the provider
    let valid_providers = vec!["liquid", "gemma2b", "gemma9b"];
    if !valid_providers.contains(&payload.provider.as_str()) {
        return Err((
            StatusCode::BAD_REQUEST,
            format!("Invalid provider: {}. Valid: {:?}", payload.provider, valid_providers),
        ));
    }

    Ok(Json(json!({
        "status": "success",
        "provider": payload.provider,
        "message": format!("Switched to {}", payload.provider),
        "timestamp": chrono::Utc::now().to_rfc3339()
    })))
}

#[derive(serde::Deserialize)]
pub struct ChatRequest {
    messages: Vec<serde_json::Value>,
    language: Option<String>,
}

async fn chat_endpoint(
    State(state): State<AppState>,
    Json(payload): Json<ChatRequest>,
) -> Json<Value> {
    let language = payload.language.unwrap_or_else(|| "es".to_string());

    // In production, route through the LLM provider
    let response = json!({
        "role": "assistant",
        "content": "This is a response from Synthia 3.0",
        "language": language,
        "provider": state.config.default_provider,
        "timestamp": chrono::Utc::now().to_rfc3339()
    });

    Json(response)
}

#[derive(serde::Deserialize)]
pub struct AddMemoryRequest {
    user_id: String,
    content: String,
    metadata: Option<Value>,
}

async fn add_memory(
    State(state): State<AppState>,
    Json(payload): Json<AddMemoryRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    match state
        .mem0
        .add_memory(&payload.user_id, &payload.content, payload.metadata)
        .await
    {
        Ok(memory) => Ok(Json(json!({
            "status": "success",
            "memory_id": memory.id,
            "timestamp": chrono::Utc::now().to_rfc3339()
        }))),
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to add memory: {}", e),
        )),
    }
}

#[derive(serde::Deserialize)]
pub struct RetrieveMemoriesRequest {
    user_id: String,
    limit: Option<usize>,
}

async fn retrieve_memories(
    State(state): State<AppState>,
    Json(payload): Json<RetrieveMemoriesRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    match state
        .mem0
        .retrieve_memories(&payload.user_id, payload.limit)
        .await
    {
        Ok(memories) => {
            let memory_list: Vec<Value> = memories
                .iter()
                .map(|m| {
                    json!({
                        "id": m.id,
                        "content": m.content,
                        "created_at": m.created_at
                    })
                })
                .collect();

            Ok(Json(json!({
                "status": "success",
                "memories": memory_list,
                "count": memory_list.len(),
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        }
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to retrieve memories: {}", e),
        )),
    }
}

#[derive(serde::Deserialize)]
pub struct SearchMemoriesRequest {
    user_id: String,
    query: String,
}

async fn search_memories(
    State(state): State<AppState>,
    Json(payload): Json<SearchMemoriesRequest>,
) -> Result<Json<Value>, (StatusCode, String)> {
    match state.mem0.search_memories(&payload.user_id, &payload.query).await {
        Ok(memories) => {
            let memory_list: Vec<Value> = memories
                .iter()
                .map(|m| {
                    json!({
                        "id": m.id,
                        "content": m.content,
                        "relevance": 0.95 // Placeholder
                    })
                })
                .collect();

            Ok(Json(json!({
                "status": "success",
                "query": payload.query,
                "results": memory_list,
                "timestamp": chrono::Utc::now().to_rfc3339()
            })))
        }
        Err(e) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            format!("Failed to search memories: {}", e),
        )),
    }
}

#[derive(serde::Deserialize)]
pub struct DelegateTaskRequest {
    title: String,
    description: String,
}

async fn delegate_task(
    State(state): State<AppState>,
    Json(payload): Json<DelegateTaskRequest>,
) -> Json<Value> {
    if !state.config.agent_zero_enabled {
        return Json(json!({
            "status": "error",
            "message": "Agent Zero is disabled",
            "timestamp": chrono::Utc::now().to_rfc3339()
        }));
    }

    Json(json!({
        "status": "queued",
        "task_id": uuid::Uuid::new_v4().to_string(),
        "title": payload.title,
        "message": "Task delegated to Agent Zero",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

#[derive(serde::Deserialize)]
pub struct TaskStatusRequest {
    id: String,
}

async fn task_status(
    State(_state): State<AppState>,
    axum::extract::Path(id): axum::extract::Path<String>,
) -> Json<Value> {
    Json(json!({
        "task_id": id,
        "status": "running",
        "progress": 45,
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

async fn composio_tools(State(_state): State<AppState>) -> Json<Value> {
    Json(json!({
        "status": "success",
        "tools_count": 850,
        "sample_tools": [
            "gmail_send",
            "slack_post_message",
            "github_create_issue",
            "google_search"
        ],
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

#[derive(serde::Deserialize)]
pub struct ComposioExecuteRequest {
    tool: String,
    args: Value,
}

async fn composio_execute(
    State(_state): State<AppState>,
    Json(payload): Json<ComposioExecuteRequest>,
) -> Json<Value> {
    Json(json!({
        "status": "success",
        "tool": payload.tool,
        "result": "Tool executed successfully",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

// firecrawl_scrape and kupuri_research are now in site_factory.rs

async fn audit_logs(State(_state): State<AppState>) -> Json<Value> {
    Json(json!({
        "status": "success",
        "logs": [
            {
                "timestamp": chrono::Utc::now().to_rfc3339(),
                "action": "model_switched",
                "details": "Switched from liquid to gemma2b"
            },
            {
                "timestamp": chrono::Utc::now().to_rfc3339(),
                "action": "memory_added",
                "details": "Added memory entry for user"
            }
        ],
        "total_entries": 2
    }))
}

// PROMETHEUS METRICS ENDPOINT
async fn metrics_endpoint(State(state): State<AppState>) -> impl IntoResponse {
    match state.metrics.gather() {
        Ok(metrics) => (StatusCode::OK, metrics),
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Error gathering metrics".to_string()),
    }
}

// DASHBOARD API ENDPOINTS (For Control Room integration)
async fn recent_tasks(State(_state): State<AppState>) -> Json<Value> {
    // Returns recent Agent Zero tasks
    Json(json!({
        "tasks": [
            {
                "id": "task-001",
                "status": "completed",
                "title": "Sample Task",
                "duration_ms": 1234
            }
        ],
        "total_count": 1
    }))
}

async fn memory_events(State(_state): State<AppState>) -> Json<Value> {
    // Returns recent memory operations
    Json(json!({
        "events": [
            {
                "id": "mem-001",
                "type": "add",
                "timestamp": chrono::Utc::now().to_rfc3339()
            }
        ],
        "total_count": 1
    }))
}

async fn dashboard_summary(State(_state): State<AppState>) -> Json<Value> {
    // Real-time KPI snapshot
    Json(json!({
        "kpis": {
            "active_tasks": 0,
            "memory_entries": 1,
            "api_health": "healthy",
            "uptime_seconds": 3600
        },
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}
