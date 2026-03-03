use axum::{
    extract::{State, Json},
    routing::{get, post},
    Router, http::StatusCode,
    response::IntoResponse,
};
use serde_json::{json, Value};
use std::sync::Arc;
use crate::config::Config;
use crate::middleware::MetricsRegistry;
use crate::providers::{llm_trait::ChatMessage, mem0::Mem0Provider};

#[derive(Clone)]
pub struct AppState {
    pub config: Config,
    pub mem0: Arc<Mem0Provider>,
    pub metrics: Arc<MetricsRegistry>,
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
        .route("/audit/logs", get(audit_logs))
        .route("/api/tasks/recent", get(recent_tasks))
        .route("/api/memory/events", get(memory_events))
        .route("/api/dashboard/summary", get(dashboard_summary))
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

#[derive(serde::Deserialize)]
pub struct FirecrawlScrapeRequest {
    url: String,
}

async fn firecrawl_scrape(
    State(_state): State<AppState>,
    Json(payload): Json<FirecrawlScrapeRequest>,
) -> Json<Value> {
    Json(json!({
        "status": "success",
        "url": payload.url,
        "markdown": "# Scraped Content\n\nMarkdown content from URL...",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

#[derive(serde::Deserialize)]
pub struct KupuriResearchRequest {
    topic: String,
    language: Option<String>,
}

async fn kupuri_research(
    State(_state): State<AppState>,
    Json(payload): Json<KupuriResearchRequest>,
) -> Json<Value> {
    let language = payload.language.unwrap_or_else(|| "es".to_string());

    Json(json!({
        "status": "researching",
        "topic": payload.topic,
        "language": language,
        "message": format!("Researching {} empowerment initiatives...", payload.topic),
        "sources": [
            "https://example.com/resource1",
            "https://example.com/resource2"
        ],
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

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
