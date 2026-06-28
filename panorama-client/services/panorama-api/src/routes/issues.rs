use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::middleware::JwtClaims;
use crate::realtime::BroadcastHub;
use crate::routes::cards::AppError;
use crate::synthia::bridge::{emit, SynthiaEvent};

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Issue {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub board_id: Option<Uuid>,
    pub title: String,
    pub severity: String,
    pub status: String,
    pub raised_by: Uuid,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct CreateIssueRequest {
    pub board_id: Option<Uuid>,
    pub title: String,
    pub description: Option<String>,
    pub severity: Option<String>,
}

pub async fn create_issue(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
    Json(body): Json<CreateIssueRequest>,
) -> Result<Json<Issue>, AppError> {
    let severity = body.severity.unwrap_or_else(|| "medium".into());
    let is_critical = severity == "critical";

    let issue = sqlx::query_as!(
        Issue,
        r#"
        INSERT INTO issues (tenant_id, board_id, title, description_es, severity, raised_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, tenant_id, board_id, title, severity, status, raised_by, created_at
        "#,
        claims.tenant_id,
        body.board_id,
        body.title,
        body.description,
        severity,
        claims.sub,
    )
    .fetch_one(&db)
    .await?;

    // Audit log
    sqlx::query!(
        "INSERT INTO issue_audit (issue_id, action, performed_by, new_status) VALUES ($1, 'created', $2, 'open')",
        issue.id, claims.sub
    )
    .execute(&db)
    .await
    .ok();

    if is_critical {
        let tenant_id = issue.tenant_id;
        let issue_id = issue.id;
        tokio::spawn(emit(SynthiaEvent::IssueRaised {
            tenant_id,
            issue_id,
            severity: "critical".into(),
        }));
    }

    Ok(Json(issue))
}

pub async fn list_issues(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
) -> Result<Json<Vec<Issue>>, AppError> {
    let issues = sqlx::query_as!(
        Issue,
        "SELECT id, tenant_id, board_id, title, severity, status, raised_by, created_at \
         FROM issues WHERE tenant_id = $1 ORDER BY created_at DESC",
        claims.tenant_id
    )
    .fetch_all(&db)
    .await?;

    Ok(Json(issues))
}

pub fn router() -> axum::Router<(PgPool, BroadcastHub)> {
    axum::Router::new()
        .route("/", axum::routing::get(list_issues).post(create_issue))
}
