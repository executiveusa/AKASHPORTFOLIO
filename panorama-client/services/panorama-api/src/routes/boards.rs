use axum::{extract::{Path, State}, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::middleware::JwtClaims;
use crate::realtime::BroadcastHub;
use crate::routes::cards::AppError;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Board {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub status: String,
    pub pm_user_id: Option<Uuid>,
    pub due_date: Option<chrono::NaiveDate>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

pub async fn list_boards(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
) -> Result<Json<Vec<Board>>, AppError> {
    let boards = sqlx::query_as!(
        Board,
        "SELECT id, tenant_id, name, description, status, pm_user_id, due_date, created_at \
         FROM boards WHERE tenant_id = $1 AND status = 'active' ORDER BY created_at DESC",
        claims.tenant_id
    )
    .fetch_all(&db)
    .await?;

    Ok(Json(boards))
}

pub async fn get_board(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
    Path(board_id): Path<Uuid>,
) -> Result<Json<Board>, AppError> {
    let board = sqlx::query_as!(
        Board,
        "SELECT id, tenant_id, name, description, status, pm_user_id, due_date, created_at \
         FROM boards WHERE id = $1 AND tenant_id = $2",
        board_id, claims.tenant_id
    )
    .fetch_one(&db)
    .await
    .map_err(|_| AppError::NotFound)?;

    Ok(Json(board))
}

pub fn router() -> axum::Router<(PgPool, BroadcastHub)> {
    axum::Router::new()
        .route("/", axum::routing::get(list_boards))
        .route("/:id", axum::routing::get(get_board))
}
