export function difyAvailable(){return Boolean(process.env.DIFY_BASE_URL && process.env.DIFY_API_KEY);}
export const localWorkflows=[{id:'wf_content',name:'Contenido semanal',highRisk:false},{id:'wf_deploy',name:'Deploy automatizado',highRisk:true}];
