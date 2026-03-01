use reqwest::Client;
use serde_json::{json, Value};
use uuid::Uuid;

const MEM0_API_BASE: &str = "https://api.mem0.ai/v1";

pub struct Mem0Provider {
    client: Client,
    api_key: String,
    org_id: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Memory {
    pub id: String,
    pub content: String,
    pub metadata: Option<Value>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ConversationMessage {
    pub role: String,
    pub content: String,
    pub memory_used: Option<Vec<String>>,
}

impl Mem0Provider {
    pub fn new(api_key: String, org_id: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
            org_id,
        }
    }

    pub async fn add_memory(
        &self,
        user_id: &str,
        memory_content: &str,
        metadata: Option<Value>,
    ) -> anyhow::Result<Memory> {
        let payload = json!({
            "memory": memory_content,
            "metadata": metadata,
            "user_id": user_id,
        });

        let response = self
            .client
            .post(format!("{}/memories/", MEM0_API_BASE))
            .header("Authorization", format!("Token {}", self.api_key))
            .header("Org-Id", &self.org_id)
            .json(&payload)
            .send()
            .await?
            .json::<Value>()
            .await?;

        let memory = Memory {
            id: response["id"].as_str().unwrap_or("").to_string(),
            content: response["memory"].as_str().unwrap_or("").to_string(),
            metadata: response.get("metadata").cloned(),
            created_at: response["created_at"].as_str().unwrap_or("").to_string(),
            updated_at: response["updated_at"].as_str().unwrap_or("").to_string(),
        };

        Ok(memory)
    }

    pub async fn retrieve_memories(
        &self,
        user_id: &str,
        limit: Option<usize>,
    ) -> anyhow::Result<Vec<Memory>> {
        let limit = limit.unwrap_or(10);
        let response = self
            .client
            .get(format!("{}/memories/", MEM0_API_BASE))
            .header("Authorization", format!("Token {}", self.api_key))
            .header("Org-Id", &self.org_id)
            .query(&[("user_id", user_id), ("limit", &limit.to_string())])
            .send()
            .await?
            .json::<Value>()
            .await?;

        let memories: Vec<Memory> = response["results"]
            .as_array()
            .unwrap_or(&vec![])
            .iter()
            .filter_map(|m| {
                Some(Memory {
                    id: m["id"].as_str()?.to_string(),
                    content: m["memory"].as_str()?.to_string(),
                    metadata: m.get("metadata").cloned(),
                    created_at: m["created_at"].as_str()?.to_string(),
                    updated_at: m["updated_at"].as_str()?.to_string(),
                })
            })
            .collect();

        Ok(memories)
    }

    pub async fn search_memories(
        &self,
        user_id: &str,
        query: &str,
    ) -> anyhow::Result<Vec<Memory>> {
        let payload = json!({
            "query": query,
            "user_id": user_id,
        });

        let response = self
            .client
            .post(format!("{}/memories/search", MEM0_API_BASE))
            .header("Authorization", format!("Token {}", self.api_key))
            .header("Org-Id", &self.org_id)
            .json(&payload)
            .send()
            .await?
            .json::<Value>()
            .await?;

        let memories: Vec<Memory> = response["results"]
            .as_array()
            .unwrap_or(&vec![])
            .iter()
            .filter_map(|m| {
                Some(Memory {
                    id: m["id"].as_str()?.to_string(),
                    content: m["memory"].as_str()?.to_string(),
                    metadata: m.get("metadata").cloned(),
                    created_at: m["created_at"].as_str()?.to_string(),
                    updated_at: m["updated_at"].as_str()?.to_string(),
                })
            })
            .collect();

        Ok(memories)
    }

    pub async fn delete_memory(&self, memory_id: &str) -> anyhow::Result<()> {
        self.client
            .delete(format!("{}/memories/{}/", MEM0_API_BASE, memory_id))
            .header("Authorization", format!("Token {}", self.api_key))
            .header("Org-Id", &self.org_id)
            .send()
            .await?;

        Ok(())
    }

    pub async fn conversation_with_memory(
        &self,
        user_id: &str,
        message: &str,
        session_id: &str,
    ) -> anyhow::Result<ConversationMessage> {
        // Retrieve relevant memories first
        let memories = self.search_memories(user_id, message).await?;

        let memory_context: Vec<String> = memories
            .iter()
            .map(|m| m.content.clone())
            .collect();

        // This would be piped to the LLM provider with context
        let payload = json!({
            "message": message,
            "user_id": user_id,
            "session_id": session_id,
            "memory_context": memory_context,
        });

        let response = self
            .client
            .post(format!("{}/conversation/", MEM0_API_BASE))
            .header("Authorization", format!("Token {}", self.api_key))
            .header("Org-Id", &self.org_id)
            .json(&payload)
            .send()
            .await?
            .json::<Value>()
            .await?;

        let msg = ConversationMessage {
            role: response["role"].as_str().unwrap_or("assistant").to_string(),
            content: response["content"].as_str().unwrap_or("").to_string(),
            memory_used: response["memory_used"]
                .as_array()
                .map(|arr| {
                    arr.iter()
                        .filter_map(|m| m.as_str().map(|s| s.to_string()))
                        .collect()
                }),
        };

        Ok(msg)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mem0_provider_creation() {
        let provider = Mem0Provider::new(
            "m0-PZpOSwzW4youXr1ji4BtqdSjFJYjioUbWmaarkBg".to_string(),
            "org_id".to_string(),
        );
        assert_eq!(
            provider.api_key,
            "m0-PZpOSwzW4youXr1ji4BtqdSjFJYjioUbWmaarkBg"
        );
    }

    #[tokio::test]
    async fn test_memory_lifecycle() {
        let provider = Mem0Provider::new(
            "test_key".to_string(),
            "test_org".to_string(),
        );

        // Test would add memory, retrieve, search, delete
        // In production, this hits the actual Mem0 API
    }
}
