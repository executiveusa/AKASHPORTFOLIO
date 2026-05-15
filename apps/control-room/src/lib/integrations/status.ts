const keys = ['DIFY_BASE_URL','DIFY_API_KEY','LANGFUSE_HOST','LANGFUSE_PUBLIC_KEY','LANGFUSE_SECRET_KEY','OPEN_WEBUI_BASE_URL','SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','NEXTAUTH_URL','GOOGLE_CLIENT_ID','AUTH_GOOGLE_ID','GOOGLE_CLIENT_SECRET','AUTH_GOOGLE_SECRET'] as const;
export function getIntegrationStatus(){return keys.map((k)=>({key:k,configured:Boolean(process.env[k])}));}
