mod api;
mod config;
mod middleware;
mod providers;

use std::sync::Arc;
use tracing_subscriber;

#[tokio::main]
async fn main() {
    // Initialize logging
    tracing_subscriber::fmt::init();

    // Load configuration
    let config = config::Config::from_env();

    // Initialize mem0 provider
    let mem0 = Arc::new(providers::mem0::Mem0Provider::new(
        config.mem0_api_key.clone(),
        config.mem0_org_id.clone(),
    ));

    // Initialize Prometheus metrics
    let metrics = Arc::new(middleware::MetricsRegistry::new()
        .expect("Failed to initialize Prometheus metrics"));

    // Create application state
    let state = api::routes::AppState {
        config: config.clone(),
        mem0,
        metrics,
    };

    // Create the Axum router
    let app = api::routes::create_router(state);

    // Bind and start the server
    let listener = tokio::net::TcpListener::bind(format!("{}:{}", config.host, config.port))
        .await
        .expect("Failed to bind to port");

    println!("🚀 Synthia 3.0 listening on http://{}:{}", config.host, config.port);
    println!("📱 Control Room: http://{}:{}/health", config.host, config.port);
    println!("🧠 Memory System: mem0 initialized");
    println!("⚡ Default Provider: {}", config.default_provider);

    if config.agent_zero_enabled {
        println!("🤖 Agent Zero: Ready for complex task delegation");
    }

    axum::serve(listener, app)
        .await
        .expect("Failed to start server");
}
