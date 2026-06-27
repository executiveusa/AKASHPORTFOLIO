mod middleware;
mod realtime;
mod routes;
mod synthia;
mod voice;

use axum::{Router, routing::get};
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let db = PgPoolOptions::new()
        .max_connections(20)
        .connect(&std::env::var("DATABASE_URL").expect("DATABASE_URL required"))
        .await
        .expect("Failed to connect to database");

    let broadcast_hub = realtime::BroadcastHub::new();

    let app = Router::new()
        .route("/health", get(|| async { "ok" }))
        .nest("/api/v1", api_router(db.clone(), broadcast_hub.clone()))
        .route("/ws/board/:board_id", get(realtime::ws_handler))
        .route("/api/voice/webhook", axum::routing::post(voice::webhook))
        .layer(middleware::JwtAuthLayer::new())
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    tracing::info!("panorama-api listening on :8080");
    axum::serve(listener, app).await.unwrap();
}

fn api_router(db: sqlx::PgPool, hub: realtime::BroadcastHub) -> Router {
    Router::new()
        .nest("/tenants",  routes::tenants::router())
        .nest("/boards",   routes::boards::router())
        .nest("/cards",    routes::cards::router())
        .nest("/issues",   routes::issues::router())
        .nest("/goals",    routes::goals::router())
        .nest("/contacts", routes::contacts::router())
        .nest("/messages", routes::messages::router())
        .nest("/translate",routes::translate::router())
        .with_state((db, hub))
}
