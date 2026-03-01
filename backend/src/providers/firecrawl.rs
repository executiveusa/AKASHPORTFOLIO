use reqwest::Client;
use serde_json::{json, Value};

const FIRECRAWL_API_BASE: &str = "https://api.firecrawl.dev/v0";

pub struct FirecrawlProvider {
    client: Client,
    api_key: String,
}

impl FirecrawlProvider {
    pub fn new(api_key: String) -> Self {
        Self {
            client: Client::new(),
            api_key,
        }
    }

    pub async fn scrape_url(&self, url: &str) -> anyhow::Result<String> {
        let payload = json!({
            "url": url,
            "formats": ["markdown"]
        });

        let response = self
            .client
            .post(format!("{}/scrape", FIRECRAWL_API_BASE))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&payload)
            .send()
            .await?
            .json::<Value>()
            .await?;

        let markdown = response["data"]["markdown"]
            .as_str()
            .unwrap_or("")
            .to_string();

        Ok(markdown)
    }

    pub async fn crawl_url(&self, url: &str) -> anyhow::Result<Vec<String>> {
        let payload = json!({
            "url": url,
            "limit": 50,
            "scrapeOptions": {
                "formats": ["markdown"]
            }
        });

        let response = self
            .client
            .post(format!("{}/crawl", FIRECRAWL_API_BASE))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&payload)
            .send()
            .await?
            .json::<Value>()
            .await?;

        let id = response["id"].as_str().unwrap_or("");
        // In production, poll the crawl job ID until completion
        Ok(vec![id.to_string()])
    }

    pub async fn search(&self, query: &str) -> anyhow::Result<Vec<String>> {
        let payload = json!({
            "query": query,
            "limit": 10
        });

        let response = self
            .client
            .post(format!("{}/search", FIRECRAWL_API_BASE))
            .header("Authorization", format!("Bearer {}", self.api_key))
            .json(&payload)
            .send()
            .await?
            .json::<Value>()
            .await?;

        // Extract URLs from results
        let urls: Vec<String> = response["results"]
            .as_array()
            .unwrap_or(&vec![])
            .iter()
            .filter_map(|r| r["url"].as_str().map(|s| s.to_string()))
            .collect();

        Ok(urls)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_firecrawl_provider_creation() {
        let provider = FirecrawlProvider::new("test_key".to_string());
        assert_eq!(provider.api_key, "test_key");
    }
}
