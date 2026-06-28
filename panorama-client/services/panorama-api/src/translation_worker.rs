use sqlx::PgPool;
use tracing::{error, info};

/// Background task: flush all cards/comments with pending_translation=true.
/// Runs once per hour via tokio::spawn in main.rs.
pub async fn run_translation_flush(db: PgPool) {
    loop {
        if let Err(e) = flush_once(&db).await {
            error!("translation flush error: {e}");
        }
        tokio::time::sleep(std::time::Duration::from_secs(3600)).await;
    }
}

async fn flush_once(db: &PgPool) -> anyhow::Result<()> {
    let deepl_key = match std::env::var("DEEPL_API_KEY") {
        Ok(k) => k,
        Err(_) => return Ok(()), // Skip if not configured
    };

    // Fetch cards needing translation (batch of 50)
    let rows = sqlx::query!(
        r#"SELECT id, body_en, body_es FROM cards WHERE pending_translation = true LIMIT 50"#
    )
    .fetch_all(db)
    .await?;

    if rows.is_empty() {
        return Ok(());
    }

    let client = reqwest::Client::new();

    for row in rows {
        // Translate EN → ES if body_es is empty
        if row.body_es.is_empty() && !row.body_en.is_empty() {
            match translate(&client, &deepl_key, &row.body_en, "ES").await {
                Ok(translated) => {
                    sqlx::query!(
                        "UPDATE cards SET body_es = $1, pending_translation = false WHERE id = $2",
                        translated,
                        row.id
                    )
                    .execute(db)
                    .await?;
                    info!("translated card {} EN→ES", row.id);
                }
                Err(e) => error!("deepl error for card {}: {e}", row.id),
            }
        }
        // Translate ES → EN if body_en is empty
        else if row.body_en.is_empty() && !row.body_es.is_empty() {
            match translate(&client, &deepl_key, &row.body_es, "EN").await {
                Ok(translated) => {
                    sqlx::query!(
                        "UPDATE cards SET body_en = $1, pending_translation = false WHERE id = $2",
                        translated,
                        row.id
                    )
                    .execute(db)
                    .await?;
                    info!("translated card {} ES→EN", row.id);
                }
                Err(e) => error!("deepl error for card {}: {e}", row.id),
            }
        } else {
            // Both present — just clear the flag
            sqlx::query!(
                "UPDATE cards SET pending_translation = false WHERE id = $1",
                row.id
            )
            .execute(db)
            .await?;
        }
    }

    Ok(())
}

async fn translate(
    client: &reqwest::Client,
    key: &str,
    text: &str,
    target: &str,
) -> anyhow::Result<String> {
    let res = client
        .post("https://api-free.deepl.com/v2/translate")
        .header("Authorization", format!("DeepL-Auth-Key {key}"))
        .json(&serde_json::json!({ "text": [text], "target_lang": target }))
        .timeout(std::time::Duration::from_secs(15))
        .send()
        .await?;

    let json: serde_json::Value = res.json().await?;
    let translated = json["translations"][0]["text"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("no translation in DeepL response"))?
        .to_string();
    Ok(translated)
}
