use reqwest::Client;
use serde_json::{json, Value};

pub struct AgentZeroProvider {
    client: Client,
    api_endpoint: String,
    api_key: String,
    enabled: bool,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AgentZeroTask {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String, // pending, running, completed, failed
    pub result: Option<Value>,
    pub created_at: String,
}

impl AgentZeroProvider {
    pub fn new(api_endpoint: String, api_key: String, enabled: bool) -> Self {
        Self {
            client: Client::new(),
            api_endpoint,
            api_key,
            enabled,
        }
    }

    pub fn is_enabled(&self) -> bool {
        self.enabled
    }

    pub async fn delegate_task(
        &self,
        title: &str,
        description: &str,
    ) -> anyhow::Result<AgentZeroTask> {
        if !self.enabled {
            return Err(anyhow::anyhow!("Agent Zero is disabled"));
        }

        let payload = json!({
            "title": title,
            "description": description,
        });

        let response = self
            .client
            .post(format!("{}/tasks", self.api_endpoint))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&payload)
            .send()
            .await?
            .json::<Value>()
            .await?;

        let task = AgentZeroTask {
            id: response["id"].as_str().unwrap_or("").to_string(),
            title: response["title"].as_str().unwrap_or("").to_string(),
            description: response["description"].as_str().unwrap_or("").to_string(),
            status: response["status"].as_str().unwrap_or("pending").to_string(),
            result: response.get("result").cloned(),
            created_at: response["created_at"].as_str().unwrap_or("").to_string(),
        };

        Ok(task)
    }

    pub async fn get_task_status(&self, task_id: &str) -> anyhow::Result<AgentZeroTask> {
        if !self.enabled {
            return Err(anyhow::anyhow!("Agent Zero is disabled"));
        }

        let response = self
            .client
            .get(format!("{}/tasks/{}", self.api_endpoint, task_id))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await?
            .json::<Value>()
            .await?;

        let task = AgentZeroTask {
            id: response["id"].as_str().unwrap_or("").to_string(),
            title: response["title"].as_str().unwrap_or("").to_string(),
            description: response["description"].as_str().unwrap_or("").to_string(),
            status: response["status"].as_str().unwrap_or("pending").to_string(),
            result: response.get("result").cloned(),
            created_at: response["created_at"].as_str().unwrap_or("").to_string(),
        };

        Ok(task)
    }

    pub async fn list_tasks(&self) -> anyhow::Result<Vec<AgentZeroTask>> {
        if !self.enabled {
            return Err(anyhow::anyhow!("Agent Zero is disabled"));
        }

        let response = self
            .client
            .get(format!("{}/tasks", self.api_endpoint))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await?
            .json::<Value>()
            .await?;

        let tasks: Vec<AgentZeroTask> = response["tasks"]
            .as_array()
            .unwrap_or(&vec![])
            .iter()
            .map(|t| AgentZeroTask {
                id: t["id"].as_str().unwrap_or("").to_string(),
                title: t["title"].as_str().unwrap_or("").to_string(),
                description: t["description"].as_str().unwrap_or("").to_string(),
                status: t["status"].as_str().unwrap_or("pending").to_string(),
                result: t.get("result").cloned(),
                created_at: t["created_at"].as_str().unwrap_or("").to_string(),
            })
            .collect();

        Ok(tasks)
    }

    pub async fn cancel_task(&self, task_id: &str) -> anyhow::Result<()> {
        if !self.enabled {
            return Err(anyhow::anyhow!("Agent Zero is disabled"));
        }

        self.client
            .post(format!("{}/tasks/{}/cancel", self.api_endpoint, task_id))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .send()
            .await?;

        Ok(())
    }
}

/// Routes complex tasks to Agent Zero based on complexity threshold
pub async fn should_delegate_to_agent_zero(task_complexity: f32) -> bool {
    // Tasks with complexity > 0.7 should be delegated
    task_complexity > 0.7
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_agent_zero_provider_creation() {
        let provider = AgentZeroProvider::new(
            "http://localhost:9000".to_string(),
            "test_key".to_string(),
            true,
        );
        assert!(provider.is_enabled());
    }

    #[test]
    fn test_agent_zero_disabled() {
        let provider = AgentZeroProvider::new(
            "http://localhost:9000".to_string(),
            "test_key".to_string(),
            false,
        );
        assert!(!provider.is_enabled());
    }
}
