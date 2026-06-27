use axum::{extract::State, Json};
use once_cell::sync::Lazy;
use regex::Regex;
use serde::{Deserialize, Serialize};
use sqlx::PgPool;

use crate::realtime::BroadcastHub;

#[derive(Debug, Serialize)]
pub struct VoiceIntent {
    pub action: VoiceAction,
    pub confidence: f32,
    pub raw: String,
}

#[derive(Debug, Serialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum VoiceAction {
    MoveCard   { target: String, to_column: String },
    AddIssue   { title: String, severity: String },
    AddComment { card_ref: String, body: String },
    FilterBy   { filter: String },
    ReadAloud  { subject: String },
    Unknown,
}

static RE_ES_MOVE:    Lazy<Regex> = Lazy::new(|| Regex::new(r"mover (.+?) a (.+)").unwrap());
static RE_ES_ISSUE:   Lazy<Regex> = Lazy::new(|| Regex::new(r"agregar issue[:\s]+(.+)").unwrap());
static RE_ES_COMMENT: Lazy<Regex> = Lazy::new(|| Regex::new(r"agregar comentario en (.+?)[:\s]+(.+)").unwrap());
static RE_ES_WHO:     Lazy<Regex> = Lazy::new(|| Regex::new(r"quién tiene asignada (.+)").unwrap());
static RE_EN_MARK:    Lazy<Regex> = Lazy::new(|| Regex::new(r"mark (.+?) as (done|review|in review|progress|in progress|planning)").unwrap());
static RE_EN_ISSUE:   Lazy<Regex> = Lazy::new(|| Regex::new(r"add issue[:\s]+(.+)").unwrap());
static RE_EN_COMMENT: Lazy<Regex> = Lazy::new(|| Regex::new(r"add comment on (.+?)[:\s]+(.+)").unwrap());
static RE_EN_WHO:     Lazy<Regex> = Lazy::new(|| Regex::new(r"who is assigned to (.+)").unwrap());

pub fn parse(transcript: &str, locale: &str) -> VoiceIntent {
    let t = transcript.to_lowercase();
    let t = t.trim();
    let (action, confidence) = if locale == "es" { match_es(t) } else { match_en(t) };
    VoiceIntent { action, confidence, raw: transcript.to_string() }
}

fn match_es(t: &str) -> (VoiceAction, f32) {
    if let Some(c) = RE_ES_MOVE.captures(t) {
        return (VoiceAction::MoveCard { target: c[1].into(), to_column: c[2].into() }, 0.92);
    }
    if let Some(c) = RE_ES_ISSUE.captures(t) {
        return (VoiceAction::AddIssue { title: c[1].into(), severity: "medium".into() }, 0.90);
    }
    if let Some(c) = RE_ES_COMMENT.captures(t) {
        return (VoiceAction::AddComment { card_ref: c[1].into(), body: c[2].into() }, 0.88);
    }
    if t.contains("tareas atrasadas") || t.contains("tareas vencidas") {
        return (VoiceAction::FilterBy { filter: "overdue".into() }, 0.95);
    }
    if let Some(c) = RE_ES_WHO.captures(t) {
        return (VoiceAction::ReadAloud { subject: c[1].into() }, 0.88);
    }
    (VoiceAction::Unknown, 0.0)
}

fn match_en(t: &str) -> (VoiceAction, f32) {
    if let Some(c) = RE_EN_MARK.captures(t) {
        return (VoiceAction::MoveCard { target: c[1].into(), to_column: c[2].into() }, 0.92);
    }
    if let Some(c) = RE_EN_ISSUE.captures(t) {
        return (VoiceAction::AddIssue { title: c[1].into(), severity: "medium".into() }, 0.90);
    }
    if let Some(c) = RE_EN_COMMENT.captures(t) {
        return (VoiceAction::AddComment { card_ref: c[1].into(), body: c[2].into() }, 0.88);
    }
    if t.contains("overdue") || t.contains("delayed") || t.contains("past due") {
        return (VoiceAction::FilterBy { filter: "overdue".into() }, 0.95);
    }
    if let Some(c) = RE_EN_WHO.captures(t) {
        return (VoiceAction::ReadAloud { subject: c[1].into() }, 0.88);
    }
    (VoiceAction::Unknown, 0.0)
}

#[derive(Deserialize)]
pub struct WebhookBody {
    pub intent: Option<serde_json::Value>,
    pub board_id: Option<uuid::Uuid>,
    pub locale: Option<String>,
    pub transcript: Option<String>,
}

pub async fn webhook(
    State((_db, _hub)): State<(PgPool, BroadcastHub)>,
    Json(body): Json<WebhookBody>,
) -> Json<VoiceIntent> {
    let transcript = body.transcript.as_deref().unwrap_or("");
    let locale = body.locale.as_deref().unwrap_or("es");
    let intent = parse(transcript, locale);
    Json(intent)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_move_card_en() {
        let i = parse("Mark the homepage design task as done", "en");
        assert!(i.confidence >= 0.85);
        assert!(matches!(i.action, VoiceAction::MoveCard { .. }));
    }

    #[test]
    fn parse_add_issue_es() {
        let i = parse("Agregar issue: el cliente no recibió sus accesos", "es");
        assert!(i.confidence >= 0.85);
        assert!(matches!(i.action, VoiceAction::AddIssue { .. }));
    }

    #[test]
    fn parse_filter_overdue_es() {
        let i = parse("mostrar tareas atrasadas", "es");
        assert!(i.confidence >= 0.90);
        assert!(matches!(i.action, VoiceAction::FilterBy { filter } if filter == "overdue"));
    }

    #[test]
    fn parse_filter_overdue_en() {
        let i = parse("show me overdue tasks", "en");
        assert!(i.confidence >= 0.90);
        assert!(matches!(i.action, VoiceAction::FilterBy { filter } if filter == "overdue"));
    }

    #[test]
    fn unknown_returns_confidence_zero() {
        let i = parse("purple elephant dancing in the rain", "en");
        assert_eq!(i.confidence, 0.0);
        assert!(matches!(i.action, VoiceAction::Unknown));
    }
}
