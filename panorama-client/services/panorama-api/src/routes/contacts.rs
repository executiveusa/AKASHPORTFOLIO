use axum::{extract::State, Json};
use serde::Serialize;
use sqlx::PgPool;
use uuid::Uuid;

use crate::middleware::JwtClaims;
use crate::realtime::BroadcastHub;
use crate::routes::cards::AppError;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Contact {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub name: String,
    pub role: Option<String>,
    pub email: Option<String>,
    pub phone: Option<String>,
    pub whatsapp: Option<String>,
    pub is_kupuri_staff: bool,
}

pub async fn list_contacts(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
) -> Result<Json<Vec<Contact>>, AppError> {
    let contacts = sqlx::query_as!(
        Contact,
        "SELECT id, tenant_id, name, role, email, phone, whatsapp, is_kupuri_staff \
         FROM contacts WHERE tenant_id = $1 ORDER BY name",
        claims.tenant_id
    )
    .fetch_all(&db)
    .await?;

    Ok(Json(contacts))
}

pub fn router() -> axum::Router<(PgPool, BroadcastHub)> {
    axum::Router::new()
        .route("/", axum::routing::get(list_contacts))
}
