use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::middleware::JwtClaims;
use crate::realtime::BroadcastHub;
use crate::routes::cards::AppError;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Tenant {
    pub id: Uuid,
    pub slug: String,
    pub name: String,
    pub locale_default: String,
    pub owner_email: String,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct CreateTenantRequest {
    pub slug: String,
    pub name: String,
    pub locale_default: Option<String>,
    pub owner_email: String,
    pub branding_json: Option<serde_json::Value>,
}

#[derive(Serialize)]
pub struct CreateTenantResponse {
    pub tenant: Tenant,
    pub client_invite_url: String,
}

pub async fn create_tenant(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
    Json(body): Json<CreateTenantRequest>,
) -> Result<Json<CreateTenantResponse>, AppError> {
    // Only owners can create tenants
    if claims.role != "owner" && claims.role != "pm" {
        return Err(AppError::NotFound);
    }

    let locale = body.locale_default.unwrap_or_else(|| "es".into());
    let branding = body.branding_json.unwrap_or(serde_json::json!({}));

    let tenant = sqlx::query_as!(
        Tenant,
        "INSERT INTO tenants (slug, name, locale_default, owner_email, branding_json) \
         VALUES ($1, $2, $3, $4, $5) \
         RETURNING id, slug, name, locale_default, owner_email, created_at",
        body.slug, body.name, locale, body.owner_email, branding
    )
    .fetch_one(&db)
    .await
    .map_err(|e| {
        if e.to_string().contains("unique") {
            AppError::NotFound // Slug collision — return 409 in real impl
        } else {
            AppError::Db(e)
        }
    })?;

    let base_url = std::env::var("NEXTAUTH_URL").unwrap_or_else(|_| "https://panorama.kupuri.app".into());
    let client_invite_url = format!("{}/api/auth/invite?tenant={}", base_url, tenant.slug);

    Ok(Json(CreateTenantResponse { tenant, client_invite_url }))
}

pub fn router() -> axum::Router<(PgPool, BroadcastHub)> {
    axum::Router::new()
        .route("/", axum::routing::post(create_tenant))
}
