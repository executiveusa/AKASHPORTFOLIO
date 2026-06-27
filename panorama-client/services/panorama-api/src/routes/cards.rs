use axum::{
    extract::{Path, State},
    Json,
};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::middleware::JwtClaims;
use crate::realtime::{BoardEvent, BroadcastHub};
use crate::synthia::bridge::{emit, SynthiaEvent};

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Card {
    pub id: Uuid,
    pub board_id: Uuid,
    pub column_id: Uuid,
    pub tenant_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub priority: String,
    pub position: f64,
}

#[derive(Deserialize)]
pub struct MoveCardRequest {
    pub to_column_id: Uuid,
    pub position: f64,
}

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found")]
    NotFound,
    #[error("WIP limit exceeded")]
    WipLimitExceeded,
    #[error("Database error: {0}")]
    Db(#[from] sqlx::Error),
}

impl axum::response::IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let (status, message) = match self {
            AppError::NotFound => (axum::http::StatusCode::NOT_FOUND, "Not found"),
            AppError::WipLimitExceeded => (axum::http::StatusCode::UNPROCESSABLE_ENTITY, "WIP limit exceeded"),
            AppError::Db(_) => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "Database error"),
        };
        (status, message).into_response()
    }
}

pub async fn move_card(
    State((db, hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
    Path(card_id): Path<Uuid>,
    Json(body): Json<MoveCardRequest>,
) -> Result<Json<Card>, AppError> {
    // 1. Verify card belongs to this tenant — application check before RLS
    let card = sqlx::query_as!(
        Card,
        "SELECT id, board_id, column_id, tenant_id, title, description, priority, position \
         FROM cards WHERE id = $1 AND tenant_id = $2",
        card_id, claims.tenant_id
    )
    .fetch_one(&db)
    .await
    .map_err(|_| AppError::NotFound)?;

    // 2. Enforce WIP limit
    let wip: Option<i32> = sqlx::query_scalar!(
        "SELECT wip_limit FROM columns WHERE id = $1",
        body.to_column_id
    )
    .fetch_optional(&db)
    .await?
    .flatten();

    if let Some(limit) = wip {
        let count: i64 = sqlx::query_scalar!(
            "SELECT COUNT(*) FROM cards WHERE column_id = $1",
            body.to_column_id
        )
        .fetch_one(&db)
        .await?
        .unwrap_or(0);

        if count >= limit as i64 {
            return Err(AppError::WipLimitExceeded);
        }
    }

    // 3. Write
    sqlx::query!(
        "UPDATE cards SET column_id = $1, position = $2, updated_at = now() WHERE id = $3",
        body.to_column_id, body.position, card_id
    )
    .execute(&db)
    .await?;

    // 4. Recalculate goals linked to this card
    sqlx::query!(
        "SELECT recalculate_goal_progress(id) FROM goals WHERE $1 = ANY(linked_cards)",
        card_id
    )
    .execute(&db)
    .await
    .ok();

    // 5. Broadcast to WebSocket subscribers
    hub.send(
        card.board_id,
        BoardEvent::CardMoved {
            card_id,
            to_column_id: body.to_column_id,
            position: body.position,
            moved_by: claims.sub,
        },
    )
    .await;

    // 6. Notify SYNTHIA — fire and forget
    let tenant_id = claims.tenant_id;
    let board_id = card.board_id;
    tokio::spawn(emit(SynthiaEvent::CardMoved { tenant_id, card_id, board_id }));

    let updated = sqlx::query_as!(
        Card,
        "SELECT id, board_id, column_id, tenant_id, title, description, priority, position \
         FROM cards WHERE id = $1",
        card_id
    )
    .fetch_one(&db)
    .await?;

    Ok(Json(updated))
}

pub fn router() -> axum::Router<(PgPool, BroadcastHub)> {
    axum::Router::new()
        .route("/:id/move", axum::routing::patch(move_card))
}
