// SYNTHIA is a downstream consumer. Never import its code. HTTP only.
// El Panorama works correctly even when SYNTHIA is offline.
use reqwest::Client;
use uuid::Uuid;

#[derive(serde::Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum SynthiaEvent {
    #[serde(rename = "panorama.card.moved")]
    CardMoved { tenant_id: Uuid, card_id: Uuid, board_id: Uuid },
    #[serde(rename = "panorama.issue.raised")]
    IssueRaised { tenant_id: Uuid, issue_id: Uuid, severity: String },
    #[serde(rename = "panorama.goal.completed")]
    GoalCompleted { tenant_id: Uuid, goal_id: Uuid, title: String },
}

pub async fn emit(event: SynthiaEvent) -> anyhow::Result<()> {
    let url = match std::env::var("SYNTHIA_SSE_BUS_URL") {
        Ok(u) => u,
        Err(_) => {
            tracing::debug!("SYNTHIA_SSE_BUS_URL not set — skipping bridge emit");
            return Ok(());
        }
    };

    let client = Client::new();
    let result = client
        .post(&url)
        .bearer_auth(std::env::var("SYNTHIA_API_KEY").unwrap_or_default())
        .json(&event)
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await;

    if let Err(e) = result {
        tracing::warn!("SYNTHIA bridge emit failed (non-fatal): {e}");
    }

    Ok(())
}
