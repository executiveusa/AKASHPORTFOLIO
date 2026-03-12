/**
 * Vercel API Client — Kupuri Media™
 * Wraps Vercel REST API using native fetch (no SDK dependency)
 */

const BASE = 'https://api.vercel.com';

export interface ProjectStatus {
  name: string;
  id: string;
  readyState: 'READY' | 'ERROR' | 'BUILDING' | 'INITIALIZING' | 'QUEUED' | 'CANCELED';
  url: string;
  createdAt: number;
  target?: string | null;
  meta?: Record<string, string>;
}

export interface DeploymentResult {
  id: string;
  url: string;
  readyState: string;
  error?: string;
}

export class VercelClient {
  private token: string;
  private teamId: string;

  constructor(token: string, teamId: string) {
    this.token = token;
    this.teamId = teamId;
  }

  private get headers() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  async getProject(projectId: string): Promise<any> {
    const res = await fetch(
      `${BASE}/v9/projects/${projectId}?teamId=${this.teamId}`,
      { headers: this.headers }
    );
    if (!res.ok) throw new Error(`GET project ${projectId}: ${res.status} ${await res.text()}`);
    return res.json();
  }

  async listDeployments(projectId: string, limit = 5): Promise<ProjectStatus[]> {
    const res = await fetch(
      `${BASE}/v6/deployments?teamId=${this.teamId}&projectId=${projectId}&limit=${limit}`,
      { headers: this.headers }
    );
    if (!res.ok) throw new Error(`LIST deployments: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.deployments ?? [];
  }

  async triggerDeploy(projectId: string, gitSource?: { ref: string; sha?: string }): Promise<DeploymentResult> {
    const body: Record<string, any> = {
      name: projectId,
      target: 'production',
    };
    if (gitSource) body.gitSource = gitSource;

    const res = await fetch(`${BASE}/v13/deployments?teamId=${this.teamId}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`DEPLOY error: ${data?.error?.message ?? JSON.stringify(data)}`);
    return { id: data.id, url: data.url, readyState: data.readyState };
  }

  async waitForDeployment(deploymentId: string, maxWaitMs = 300_000): Promise<ProjectStatus> {
    const start = Date.now();
    while (Date.now() - start < maxWaitMs) {
      const res = await fetch(
        `${BASE}/v13/deployments/${deploymentId}?teamId=${this.teamId}`,
        { headers: this.headers }
      );
      const d = await res.json();
      if (['READY', 'ERROR', 'CANCELED'].includes(d.readyState)) {
        return d;
      }
      await new Promise(r => setTimeout(r, 5000));
    }
    throw new Error(`Deployment ${deploymentId} timed out after ${maxWaitMs}ms`);
  }

  async getBuildLogs(deploymentId: string): Promise<string[]> {
    const res = await fetch(
      `${BASE}/v3/deployments/${deploymentId}/events?teamId=${this.teamId}&types=error`,
      { headers: this.headers }
    );
    if (!res.ok) return [`Could not fetch logs: ${res.status}`];
    const events = await res.json();
    return events.filter((e: any) => e.level === 'error').map((e: any) => e.text);
  }

  async listProjects(limit = 100): Promise<any[]> {
    const res = await fetch(
      `${BASE}/v9/projects?teamId=${this.teamId}&limit=${limit}`,
      { headers: this.headers }
    );
    if (!res.ok) throw new Error(`LIST projects: ${res.status}`);
    const data = await res.json();
    return data.projects ?? [];
  }
}
