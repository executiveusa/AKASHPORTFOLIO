use axum::{
    extract::{Path, State},
    Json,
};
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

#[derive(Deserialize)]
pub struct InviteRequest {
    pub email: String,
}

#[derive(Serialize)]
pub struct InviteResponse {
    pub message: String,
}

pub async fn invite_to_tenant(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
    Path(tenant_id): Path<Uuid>,
    Json(body): Json<InviteRequest>,
) -> Result<Json<InviteResponse>, AppError> {
    if claims.role != "owner" && claims.role != "pm" {
        return Err(AppError::NotFound);
    }

    // Verify tenant exists
    let exists: Option<bool> = sqlx::query_scalar!(
        "SELECT true FROM tenants WHERE id = $1",
        tenant_id
    )
    .fetch_optional(&db)
    .await
    .map_err(AppError::Db)?;

    if exists.is_none() {
        return Err(AppError::NotFound);
    }

    // Call Supabase Admin API to send magic link
    let supabase_url = std::env::var("SUPABASE_URL").unwrap_or_default();
    let service_role_key = std::env::var("SUPABASE_SERVICE_ROLE_KEY").unwrap_or_default();
    let redirect_url = format!(
        "{}/api/auth/callback?tenant={}",
        std::env::var("PANORAMA_BASE_URL").unwrap_or_else(|_| "https://panorama.kupuri.app".into()),
        tenant_id
    );

    let client = reqwest::Client::new();
    let invite_res = client
        .post(format!("{}/auth/v1/invite", supabase_url))
        .bearer_auth(&service_role_key)
        .header("apikey", &service_role_key)
        .json(&serde_json::json!({
            "email": body.email,
            "data": { "tenant_id": tenant_id.to_string() },
            "redirect_to": redirect_url
        }))
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|_| AppError::NotFound)?;

    if !invite_res.status().is_success() {
        return Err(AppError::NotFound);
    }

    Ok(Json(InviteResponse {
        message: format!("Invitation sent to {}", body.email),
    }))
}

#[derive(Deserialize)]
pub struct UpdateBrandingRequest {
    pub branding_json: serde_json::Value,
}

pub async fn update_branding(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
    Path(tenant_id): Path<Uuid>,
    Json(body): Json<UpdateBrandingRequest>,
) -> Result<Json<Tenant>, AppError> {
    if claims.role != "owner" && claims.role != "pm" {
        return Err(AppError::NotFound);
    }

    let tenant = sqlx::query_as!(
        Tenant,
        "UPDATE tenants SET branding_json = $1 WHERE id = $2 \
         RETURNING id, slug, name, locale_default, owner_email, created_at",
        body.branding_json,
        tenant_id
    )
    .fetch_optional(&db)
    .await
    .map_err(AppError::Db)?
    .ok_or(AppError::NotFound)?;

    Ok(Json(tenant))
}

pub fn router() -> axum::Router<(PgPool, BroadcastHub)> {
    axum::Router::new()
        .route("/", axum::routing::post(create_tenant))
        .route("/:id/invite", axum::routing::post(invite_to_tenant))
        .route("/:id/branding", axum::routing::patch(update_branding))
}
