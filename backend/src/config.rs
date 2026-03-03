use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Config {
    pub port: u16,
    pub host: String,
    pub workspace_root: String,
    pub default_provider: String,

    // LLM Providers
    pub liquid_api_key: String,
    pub gemma_2b_model_path: String,
    pub gemma_9b_model_path: String,

    // Tools
    pub firecrawl_api_key: String,
    pub brightdata_token: String,
    pub brightdata_mcp_url: String,
    pub retriever_api_key: String,
    pub retriever_mcp_url: String,
    pub orca_api_key: String,
    pub orca_api_endpoint: String,
    pub composio_api_key: String,

    // Memory
    pub mem0_api_key: String,
    pub mem0_org_id: String,

    // Hostinger
    pub hostinger_api_token: String,
    pub hostinger_vps_id: String,
    pub hostinger_ssh_host: String,
    pub hostinger_ssh_user: String,
    pub hostinger_ssh_port: u16,
    pub hostinger_deploy_path: String,

    // Kupuri Media
    pub system_prompt_es: String,
    pub system_prompt_en: String,
    pub kupuri_blog_url: String,
    pub kupuri_api_url: String,

    // Agent Zero
    pub agent_zero_enabled: bool,
    pub agent_zero_docker_image: String,
    pub agent_zero_port: u16,
    pub agent_zero_api_key: String,
}

impl Config {
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        Self {
            port: env::var("PORT")
                .unwrap_or_else(|_| "42617".to_string())
                .parse()
                .unwrap_or(42617),
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            workspace_root: env::var("WORKSPACE_ROOT")
                .unwrap_or_else(|_| "./workspace".to_string()),
            default_provider: env::var("DEFAULT_PROVIDER")
                .unwrap_or_else(|_| "liquid".to_string()),

            liquid_api_key: env::var("LIQUID_API_KEY")
                .unwrap_or_else(|_| "".to_string()),
            gemma_2b_model_path: env::var("GEMMA_2B_MODEL_PATH")
                .unwrap_or_else(|_| "./workspace/models/gemma-2-2b-it-Q5_K_M.gguf".to_string()),
            gemma_9b_model_path: env::var("GEMMA_9B_MODEL_PATH")
                .unwrap_or_else(|_| "./workspace/models/gemma-2-9b-it-Q4_K_M.gguf".to_string()),

            firecrawl_api_key: env::var("FIRECRAWL_API_KEY")
                .unwrap_or_else(|_| "".to_string()),
            brightdata_token: env::var("BRIGHTDATA_TOKEN")
                .unwrap_or_else(|_| "".to_string()),
            brightdata_mcp_url: env::var("BRIGHTDATA_MCP_URL")
                .unwrap_or_else(|_| "https://mcp.brightdata.com".to_string()),
            retriever_api_key: env::var("RETRIEVER_API_KEY")
                .unwrap_or_else(|_| "".to_string()),
            retriever_mcp_url: env::var("RETRIEVER_MCP_URL")
                .unwrap_or_else(|_| "https://mcp.rtrvr.ai".to_string()),
            orca_api_key: env::var("ORCA_API_KEY")
                .unwrap_or_else(|_| "".to_string()),
            orca_api_endpoint: env::var("ORCA_API_ENDPOINT")
                .unwrap_or_else(|_| "https://api.orca.computer/v1".to_string()),
            composio_api_key: env::var("COMPOSIO_API_KEY")
                .unwrap_or_else(|_| "".to_string()),

            mem0_api_key: env::var("MEM0_API_KEY")
                .unwrap_or_else(|_| "m0-PZpOSwzW4youXr1ji4BtqdSjFJYjioUbWmaarkBg".to_string()),
            mem0_org_id: env::var("MEM0_ORG_ID")
                .unwrap_or_else(|_| "".to_string()),

            hostinger_api_token: env::var("HOSTINGER_API_TOKEN")
                .unwrap_or_else(|_| "".to_string()),
            hostinger_vps_id: env::var("HOSTINGER_VPS_ID")
                .unwrap_or_else(|_| "".to_string()),
            hostinger_ssh_host: env::var("HOSTINGER_SSH_HOST")
                .unwrap_or_else(|_| "".to_string()),
            hostinger_ssh_user: env::var("HOSTINGER_SSH_USER")
                .unwrap_or_else(|_| "root".to_string()),
            hostinger_ssh_port: env::var("HOSTINGER_SSH_PORT")
                .unwrap_or_else(|_| "22".to_string())
                .parse()
                .unwrap_or(22),
            hostinger_deploy_path: env::var("HOSTINGER_DEPLOY_PATH")
                .unwrap_or_else(|_| "/opt/synthia".to_string()),

            system_prompt_es: env::var("SYSTEM_PROMPT_ES")
                .unwrap_or_else(|_| "Eres Synthia 3.0, asistente de Kupuri Media.".to_string()),
            system_prompt_en: env::var("SYSTEM_PROMPT_EN")
                .unwrap_or_else(|_| "You are Synthia 3.0, assistant for Kupuri Media.".to_string()),
            kupuri_blog_url: env::var("KUPURI_BLOG_URL")
                .unwrap_or_else(|_| "https://kupuri.media/blog".to_string()),
            kupuri_api_url: env::var("KUPURI_API_URL")
                .unwrap_or_else(|_| "https://api.kupuri.media".to_string()),

            agent_zero_enabled: env::var("AGENT_ZERO_ENABLED")
                .unwrap_or_else(|_| "true".to_string())
                .parse()
                .unwrap_or(true),
            agent_zero_docker_image: env::var("AGENT_ZERO_DOCKER_IMAGE")
                .unwrap_or_else(|_| "agent0ai/agent-zero:latest".to_string()),
            agent_zero_port: env::var("AGENT_ZERO_PORT")
                .unwrap_or_else(|_| "9000".to_string())
                .parse()
                .unwrap_or(9000),
            agent_zero_api_key: env::var("AGENT_ZERO_API_KEY")
                .unwrap_or_else(|_| "".to_string()),
        }
    }
}
