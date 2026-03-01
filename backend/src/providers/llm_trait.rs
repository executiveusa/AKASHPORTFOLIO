use async_trait::async_trait;
use serde_json::json;
use std::sync::Arc;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ProviderType {
    Liquid,   // Liquid LEAP Elite (1.2B)
    Gemma2B,  // Gemma-2-2B-it-Q5_K_M
    Gemma9B,  // Gemma-2-9B-it-Q4_K_M
}

impl ProviderType {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Liquid => "liquid",
            Self::Gemma2B => "gemma2b",
            Self::Gemma9B => "gemma9b",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "liquid" => Some(Self::Liquid),
            "gemma2b" => Some(Self::Gemma2B),
            "gemma9b" => Some(Self::Gemma9B),
            _ => None,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct ChatResponse {
    pub content: String,
    pub provider: String,
    pub tokens_used: Option<usize>,
}

#[async_trait]
pub trait LlmProvider: Send + Sync {
    async fn chat(&self, messages: Vec<ChatMessage>) -> anyhow::Result<ChatResponse>;
    async fn switch_model(&mut self, model_id: &str) -> anyhow::Result<()>;
    fn provider_type(&self) -> ProviderType;
}

pub struct LlmRegistry {
    config: crate::config::Config,
}

impl LlmRegistry {
    pub fn new(config: crate::config::Config) -> Self {
        Self { config }
    }

    pub async fn chat(&self, messages: Vec<ChatMessage>) -> anyhow::Result<ChatResponse> {
        // Route to appropriate provider
        let provider_type =
            ProviderType::from_str(&self.config.default_provider)
                .unwrap_or(ProviderType::Liquid);

        match provider_type {
            ProviderType::Liquid => self.chat_liquid(messages).await,
            ProviderType::Gemma2B => self.chat_gemma2b(messages).await,
            ProviderType::Gemma9B => self.chat_gemma9b(messages).await,
        }
    }

    async fn chat_liquid(&self, messages: Vec<ChatMessage>) -> anyhow::Result<ChatResponse> {
        // Liquid AI LEAP Elite mock response
        // In production, call the Liquid API endpoint
        Ok(ChatResponse {
            content: format!(
                "Response from Liquid LEAP Elite (1.2B): Processed {} messages",
                messages.len()
            ),
            provider: "liquid".to_string(),
            tokens_used: Some(150),
        })
    }

    async fn chat_gemma2b(&self, messages: Vec<ChatMessage>) -> anyhow::Result<ChatResponse> {
        // Gemma 2B mock response
        Ok(ChatResponse {
            content: format!(
                "Response from Gemma-2-2B-it: Processed {} messages",
                messages.len()
            ),
            provider: "gemma2b".to_string(),
            tokens_used: Some(100),
        })
    }

    async fn chat_gemma9b(&self, messages: Vec<ChatMessage>) -> anyhow::Result<ChatResponse> {
        // Gemma 9B mock response
        Ok(ChatResponse {
            content: format!(
                "Response from Gemma-2-9B-it: Processed {} messages",
                messages.len()
            ),
            provider: "gemma9b".to_string(),
            tokens_used: Some(300),
        })
    }

    pub async fn switch(&mut self, provider: &str) -> anyhow::Result<String> {
        if ProviderType::from_str(provider).is_some() {
            // In production, validate and switch
            Ok(format!("Switched to provider: {}", provider))
        } else {
            Err(anyhow::anyhow!(
                "Unknown provider: {}. Valid options: liquid, gemma2b, gemma9b",
                provider
            ))
        }
    }
}
