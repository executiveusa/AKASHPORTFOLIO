use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::middleware::JwtClaims;
use crate::realtime::BroadcastHub;
use crate::routes::cards::AppError;
use crate::synthia::bridge::{emit, SynthiaEvent};

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Goal {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub board_id: Option<Uuid>,
    pub title_en: String,
    pub title_es: Option<String>,
    pub target_date: Option<chrono::NaiveDate>,
    pub percent_complete: i32,
    pub status: String,
    pub linked_cards: Vec<Uuid>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct CreateGoalRequest {
    pub board_id: Option<Uuid>,
    pub title_en: String,
    pub title_es: Option<String>,
    pub target_date: Option<chrono::NaiveDate>,
    pub linked_cards: Option<Vec<Uuid>>,
}

pub async fn create_goal(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
    Json(body): Json<CreateGoalRequest>,
) -> Result<Json<Goal>, AppError> {
    let linked = body.linked_cards.unwrap_or_default();

    let goal = sqlx::query_as!(
        Goal,
        r#"
        INSERT INTO goals (tenant_id, board_id, title_en, title_es, target_date, owner_id, linked_cards)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, tenant_id, board_id, title_en, title_es, target_date,
                  percent_complete, status, linked_cards as "linked_cards: Vec<Uuid>", created_at
        "#,
        claims.tenant_id,
        body.board_id,
        body.title_en,
        body.title_es,
        body.target_date,
        claims.sub,
        &linked as &[Uuid],
    )
    .fetch_one(&db)
    .await?;

    // Calculate initial progress
    sqlx::query!("SELECT recalculate_goal_progress($1)", goal.id)
        .execute(&db)
        .await
        .ok();

    Ok(Json(goal))
}

pub async fn list_goals(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
) -> Result<Json<Vec<Goal>>, AppError> {
    let goals = sqlx::query_as!(
        Goal,
        r#"
        SELECT id, tenant_id, board_id, title_en, title_es, target_date,
               percent_complete, status, linked_cards as "linked_cards: Vec<Uuid>", created_at
        FROM goals WHERE tenant_id = $1 ORDER BY created_at DESC
        "#,
        claims.tenant_id
    )
    .fetch_all(&db)
    .await?;

    // Emit completion events for 100% goals
    for goal in &goals {
        if goal.status == "completed" {
            let t = claims.tenant_id;
            let gid = goal.id;
            let title = goal.title_en.clone();
            tokio::spawn(emit(SynthiaEvent::GoalCompleted { tenant_id: t, goal_id: gid, title }));
        }
    }

    Ok(Json(goals))
}

pub fn router() -> axum::Router<(PgPool, BroadcastHub)> {
    axum::Router::new()
        .route("/", axum::routing::get(list_goals).post(create_goal))
}
