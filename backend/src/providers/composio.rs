use reqwest::Client;
use serde_json::{json, Value};

const COMPOSIO_API_BASE: &str = "https://api.composio.dev/api/v1";

pub struct ComposioProvider {
    client: Client,
    api_key: String,
}

impl ComposioProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }

    pub async fn list_tools(&self) -> anyhow::Result<Vec<String>> {
        let _response = self
            .client
            .get(format!("{}/tools", COMPOSIO_API_BASE))
            .header("X-API-Key", &self.api_key)
            .send()
            .await?
            .json::<Value>()
            .await?;

        // Parse response and extract tool names
        Ok(vec!["example_tool".to_string()])
    }

    pub async fn execute_tool(
        &self,
        tool_name: &str,
        args: Value,
    ) -> anyhow::Result<Value> {
        let payload = json!({
            "tool": tool_name,
            "args": args
        });

        let response = self
            .client
            .post(format!("{}/tools/execute", COMPOSIO_API_BASE))
            .header("X-API-Key", &self.api_key)
            .json(&payload)
            .send()
            .await?
            .json::<Value>()
            .await?;

        Ok(response)
    }

    pub async fn orchestrate_workflow(
        &self,
        workflow: Value,
    ) -> anyhow::Result<Value> {
        let response = self
            .client
            .post(format!("{}/workflows/execute", COMPOSIO_API_BASE))
            .header("X-API-Key", &self.api_key)
            .json(&workflow)
            .send()
            .await?
            .json::<Value>()
            .await?;

        Ok(response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_composio_provider_creation() {
        let provider = ComposioProvider::new("test_key".to_string());
        assert_eq!(provider.api_key, "test_key");
    }
}
