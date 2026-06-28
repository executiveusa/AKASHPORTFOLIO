use axum::{
    extract::{Path, WebSocketUpgrade, ws::{WebSocket, Message}},
    response::Response,
};
use futures_util::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tokio::sync::{broadcast, RwLock};
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "PascalCase")]
pub enum BoardEvent {
    CardMoved {
        card_id: Uuid,
        to_column_id: Uuid,
        position: f64,
        moved_by: Uuid,
    },
    IssueCreated {
        issue_id: Uuid,
    },
    GoalUpdated {
        goal_id: Uuid,
        percent_complete: i32,
    },
    PresenceJoin {
        user_id: Uuid,
        display_name: String,
    },
}

#[derive(Clone)]
pub struct BroadcastHub {
    channels: Arc<RwLock<HashMap<Uuid, broadcast::Sender<BoardEvent>>>>,
}

impl BroadcastHub {
    pub fn new() -> Self {
        Self {
            channels: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub async fn send(&self, board_id: Uuid, event: BoardEvent) {
        let channels = self.channels.read().await;
        if let Some(tx) = channels.get(&board_id) {
            let _ = tx.send(event);
        }
    }

    async fn subscribe(&self, board_id: Uuid) -> broadcast::Receiver<BoardEvent> {
        let mut channels = self.channels.write().await;
        let tx = channels
            .entry(board_id)
            .or_insert_with(|| broadcast::channel(128).0);
        tx.subscribe()
    }
}

pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Path(board_id): Path<Uuid>,
    axum::Extension(hub): axum::Extension<BroadcastHub>,
) -> Response {
    ws.on_upgrade(move |socket| handle_socket(socket, board_id, hub))
}

async fn handle_socket(socket: WebSocket, board_id: Uuid, hub: BroadcastHub) {
    let mut rx = hub.subscribe(board_id).await;
    let (mut sender, mut receiver) = socket.split();

    let send_task = tokio::spawn(async move {
        while let Ok(event) = rx.recv().await {
            if let Ok(json) = serde_json::to_string(&event) {
                if sender.send(Message::Text(json)).await.is_err() {
                    break;
                }
            }
        }
    });

    while receiver.next().await.is_some() {}
    send_task.abort();
}
