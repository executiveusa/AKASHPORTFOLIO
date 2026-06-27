use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::middleware::JwtClaims;
use crate::realtime::BroadcastHub;
use crate::routes::cards::AppError;

#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Message {
    pub id: Uuid,
    pub tenant_id: Uuid,
    pub thread_id: Uuid,
    pub sender_id: Uuid,
    pub body: String,
    pub original_lang: String,
    pub body_translated: Option<String>,
    pub pending_translation: bool,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Deserialize)]
pub struct CreateMessageRequest {
    pub thread_id: Option<Uuid>,
    pub body: String,
    pub original_lang: Option<String>,
}

pub async fn create_message(
    State((db, _hub)): State<(PgPool, BroadcastHub)>,
    axum::Extension(claims): axum::Extension<JwtClaims>,
    Json(body): Json<CreateMessageRequest>,
) -> Result<Json<Message>, AppError> {
    let lang = body.original_lang.unwrap_or_else(|| "es".into());
    let thread = body.thread_id.unwrap_or_else(Uuid::new_v4);

    let msg = sqlx::query_as!(
        Message,
        r#"
        INSERT INTO messages (tenant_id, thread_id, sender_id, body, original_lang, pending_translation)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING id, tenant_id, thread_id, sender_id, body, original_lang,
                  body_translated, pending_translation, created_at
        "#,
        claims.tenant_id, thread, claims.sub, body.body, lang
    )
    .fetch_one(&db)
    .await?;

    // Trigger async translation via DeepL
    let db2 = db.clone();
    let msg_id = msg.id;
    let body_text = msg.body.clone();
    let source_lang = lang.clone();
    tokio::spawn(async move {
        translate_and_save(&db2, msg_id, &body_text, &source_lang).await;
    });

    Ok(Json(msg))
}

async fn translate_and_save(db: &PgPool, msg_id: Uuid, body: &str, source_lang: &str) {
    let deepl_key = match std::env::var("DEEPL_API_KEY") {
        Ok(k) => k,
        Err(_) => return,
    };

    let target = if source_lang == "es" { "EN" } else { "ES" };
    let client = reqwest::Client::new();

    let result = client
        .post("https://api-free.deepl.com/v2/translate")
        .header("Authorization", format!("DeepL-Auth-Key {deepl_key}"))
        .json(&serde_json::json!({
            "text": [body],
            "target_lang": target,
        }))
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await;

    if let Ok(res) = result {
        if let Ok(json) = res.json::<serde_json::Value>().await {
            if let Some(translated) = json["translations"][0]["text"].as_str() {
                sqlx::query!(
                    "UPDATE messages SET body_translated = $1, pending_translation = false WHERE id = $2",
                    translated, msg_id
                )
                .execute(db)
                .await
                .ok();
            }
        }
    }
}

pub fn router() -> axum::Router<(PgPool, BroadcastHub)> {
    axum::Router::new()
        .route("/", axum::routing::post(create_message))
}
