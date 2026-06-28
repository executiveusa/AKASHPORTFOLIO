use axum::{
    body::Body,
    extract::Request,
    http::{HeaderMap, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, DecodingKey, Validation, Algorithm};
use serde::{Deserialize, Serialize};
use tower::Layer;
use uuid::Uuid;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct JwtClaims {
    pub sub: Uuid,
    pub tenant_id: Uuid,
    pub role: String,
    pub locale: Option<String>,
    pub exp: u64,
}

#[derive(Clone)]
pub struct JwtAuthLayer;

impl JwtAuthLayer {
    pub fn new() -> Self { Self }
}

impl<S> Layer<S> for JwtAuthLayer {
    type Service = JwtAuthMiddleware<S>;
    fn layer(&self, inner: S) -> Self::Service {
        JwtAuthMiddleware { inner }
    }
}

#[derive(Clone)]
pub struct JwtAuthMiddleware<S> {
    inner: S,
}

impl<S> tower::Service<Request> for JwtAuthMiddleware<S>
where
    S: tower::Service<Request, Response = Response> + Clone + Send + 'static,
    S::Future: Send + 'static,
{
    type Response = Response;
    type Error = S::Error;
    type Future = std::pin::Pin<Box<dyn std::future::Future<Output = Result<Self::Response, Self::Error>> + Send>>;

    fn poll_ready(&mut self, cx: &mut std::task::Context<'_>) -> std::task::Poll<Result<(), Self::Error>> {
        self.inner.poll_ready(cx)
    }

    fn call(&mut self, mut req: Request) -> Self::Future {
        let skip = req.uri().path() == "/health"
            || req.uri().path().starts_with("/ws/")
            || req.uri().path() == "/api/voice/webhook";

        let mut inner = self.inner.clone();

        Box::pin(async move {
            if !skip {
                if let Some(claims) = extract_claims(req.headers()) {
                    req.extensions_mut().insert(claims);
                } else {
                    return Ok(Response::builder()
                        .status(StatusCode::UNAUTHORIZED)
                        .body(Body::from("Unauthorized"))
                        .unwrap());
                }
            }
            inner.call(req).await
        })
    }
}

fn extract_claims(headers: &HeaderMap) -> Option<JwtClaims> {
    let auth = headers.get("authorization")?.to_str().ok()?;
    let token = auth.strip_prefix("Bearer ")?;
    let secret = std::env::var("SUPABASE_JWT_SECRET").ok()?;
    let key = DecodingKey::from_secret(secret.as_bytes());
    let mut validation = Validation::new(Algorithm::HS256);
    validation.set_audience(&["authenticated"]);
    decode::<JwtClaims>(token, &key, &validation).ok().map(|d| d.claims)
}
