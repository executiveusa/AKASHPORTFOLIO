use axum::{extract::State, Json};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::realtime::BroadcastHub;
use crate::routes::cards::AppError;

#[derive(Deserialize)]
pub struct TranslateRequest {
    pub text: String,
    pub target_lang: String, // "EN" or "ES"
}

#[derive(Serialize)]
pub struct TranslateResponse {
    pub translated: String,
    pub source_lang: Option<String>,
}

pub async fn translate(
    State((_db, _hub)): State<(PgPool, BroadcastHub)>,
    Json(body): Json<TranslateRequest>,
) -> Result<Json<TranslateResponse>, AppError> {
    let key = std::env::var("DEEPL_API_KEY").map_err(|_| AppError::NotFound)?;

    let client = reqwest::Client::new();
    let res = client
        .post("https://api-free.deepl.com/v2/translate")
        .header("Authorization", format!("DeepL-Auth-Key {key}"))
        .json(&serde_json::json!({
            "text": [body.text],
            "target_lang": body.target_lang,
        }))
        .timeout(std::time::Duration::from_secs(10))
        .send()
        .await
        .map_err(|_| AppError::NotFound)?;

    let json: serde_json::Value = res.json().await.map_err(|_| AppError::NotFound)?;
    let translated = json["translations"][0]["text"]
        .as_str()
        .ok_or(AppError::NotFound)?
        .to_string();
    let source_lang = json["translations"][0]["detected_source_language"]
        .as_str()
        .map(|s| s.to_string());

    Ok(Json(TranslateResponse { translated, source_lang }))
}

pub fn router() -> axum::Router<(PgPool, BroadcastHub)> {
    axum::Router::new()
        .route("/", axum::routing::post(translate))
}
