/**
 * Synthia 3.0 API Client
 *
 * Unified API client for Synthia 3.0 backend integration.
 * Routes all control-room requests to the Synthia backend instead of local /api/* endpoints.
 * Implements automatic fallback to local endpoints during migration phase.
 */

export interface SynthiaConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  fallbackToLocal?: boolean;
}

const DEFAULT_CONFIG: SynthiaConfig = {
  baseUrl: process.env.NEXT_PUBLIC_SYNTHIA_API_URL || "http://localhost:9000/api",
  apiKey: process.env.NEXT_PUBLIC_SYNTHIA_API_KEY,
  timeout: 5000,
  fallbackToLocal: true,
};

export class SynthiaAPIClient {
  private config: SynthiaConfig;

  constructor(config?: Partial<SynthiaConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: { timeout?: number; fallbackEndpoint?: string }
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const controller = new AbortController();
      const timeout = options?.timeout ?? this.config.timeout ?? 5000;
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (err) {
      console.warn(`[synthia-api] Request failed to ${endpoint}:`, err);

      if (this.config.fallbackToLocal && options?.fallbackEndpoint) {
        console.log(`[synthia-api] Falling back to local ${options.fallbackEndpoint}`);
        return this.fallbackToLocal(method, options.fallbackEndpoint, data);
      }

      throw err;
    }
  }

  private async fallbackToLocal<T>(
    method: string,
    endpoint: string,
    data?: unknown
  ): Promise<T> {
    const url = `/api${endpoint}`;
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return (await res.json()) as T;
  }

  // ===== COUNCIL / ORCHESTRATOR =====

  async getCouncilStatus(meetingId?: string) {
    return this.request(
      "GET",
      `/council${meetingId ? `?meetingId=${encodeURIComponent(meetingId)}` : ""}`,
      undefined,
      { fallbackEndpoint: `/council${meetingId ? `?meetingId=${encodeURIComponent(meetingId)}` : ""}` }
    );
  }

  async startCouncilMeeting(data: { name: string; participants: string[] }) {
    return this.request("POST", "/council/start", data, { fallbackEndpoint: "/council/start" });
  }

  subscribeToCouncilOrchestrator(
    meetingId: string,
    onMessage: (data: unknown) => void,
    onError?: (err: Error) => void
  ) {
    const eventSourceUrl = `${this.config.baseUrl}/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`;

    try {
      const es = new EventSource(eventSourceUrl);
      es.onmessage = (event) => onMessage(JSON.parse(event.data));
      es.onerror = (err) => {
        es.close();
        if (onError) onError(err as unknown as Error);
      };
      return () => es.close();
    } catch (err) {
      const fallbackUrl = `/api/council/orchestrator?meetingId=${encodeURIComponent(meetingId)}`;
      const es = new EventSource(fallbackUrl);
      es.onmessage = (event) => onMessage(JSON.parse(event.data));
      es.onerror = (err) => {
        es.close();
        if (onError) onError(err as unknown as Error);
      };
      return () => es.close();
    }
  }

  // ===== SWARM / AGENT STATUS =====

  async getSwarmStatus() {
    return this.request("GET", "/swarm", undefined, { fallbackEndpoint: "/swarm" });
  }

  async getAgentStatus(agentId: string) {
    return this.request("GET", `/swarm/${agentId}`, undefined, {
      fallbackEndpoint: `/swarm/${agentId}`,
    });
  }

  // ===== MEETING MANAGEMENT =====

  async getMeetingStatus(meetingId: string) {
    return this.request("GET", `/meeting/${meetingId}`, undefined, {
      fallbackEndpoint: `/meeting/${meetingId}`,
    });
  }

  async createMeeting(data: { name: string; type: string; agents: string[] }) {
    return this.request("POST", "/meeting", data, { fallbackEndpoint: "/meeting" });
  }

  subscribeToMeeting(
    meetingId: string,
    onMessage: (data: unknown) => void,
    onError?: (err: Error) => void
  ) {
    const eventSourceUrl = `${this.config.baseUrl}/meeting/${meetingId}/live`;

    try {
      const es = new EventSource(eventSourceUrl);
      es.onmessage = (event) => onMessage(JSON.parse(event.data));
      es.onerror = () => {
        es.close();
        if (onError) onError(new Error("Connection closed"));
      };
      return () => es.close();
    } catch {
      const fallbackUrl = `/api/meeting/${meetingId}/live`;
      const es = new EventSource(fallbackUrl);
      es.onmessage = (event) => onMessage(JSON.parse(event.data));
      es.onerror = () => {
        es.close();
        if (onError) onError(new Error("Connection closed"));
      };
      return () => es.close();
    }
  }

  // ===== AGENT MAIL / MESSAGING =====

  async getAgentMail(agentId: string) {
    return this.request("GET", `/mail/${agentId}`, undefined, {
      fallbackEndpoint: `/mail/${agentId}`,
    });
  }

  async markMailAsRead(agentId: string, mailId: string) {
    return this.request("PATCH", `/mail/${agentId}/${mailId}/read`, {}, {
      fallbackEndpoint: `/mail/${agentId}/${mailId}/read`,
    });
  }

  async sendMail(fromAgentId: string, data: { to: string; subject: string; body: string }) {
    return this.request("POST", `/mail/${fromAgentId}/send`, data, {
      fallbackEndpoint: `/mail/${fromAgentId}/send`,
    });
  }

  // ===== HERALD / TOOL MANAGEMENT =====

  async getToolsRegistry() {
    return this.request("GET", "/herald/tools", undefined, {
      fallbackEndpoint: "/herald/tools",
    });
  }

  async bootstrapTools() {
    return this.request("POST", "/herald/bootstrap", {}, {
      fallbackEndpoint: "/herald/bootstrap",
    });
  }

  async executeTool(toolId: string, input: unknown) {
    return this.request("POST", "/herald/execute", { tool_id: toolId, input }, {
      fallbackEndpoint: "/herald/execute",
    });
  }

  // ===== REVENUE TRACKING =====

  async getRevenueData(period?: string) {
    return this.request("GET", `/revenue${period ? `?period=${period}` : ""}`, undefined, {
      fallbackEndpoint: `/revenue${period ? `?period=${period}` : ""}`,
    });
  }

  async recordTransaction(data: { amount: number; currency: string; source: string }) {
    return this.request("POST", "/revenue/transaction", data, {
      fallbackEndpoint: "/revenue/transaction",
    });
  }

  // ===== DASHBOARD DATA =====

  async getDashboardData() {
    return this.request("GET", "/dashboard", undefined, {
      fallbackEndpoint: "/dashboard",
    });
  }

  async getDashboardMetrics(period?: string) {
    return this.request("GET", `/dashboard/metrics${period ? `?period=${period}` : ""}`, undefined, {
      fallbackEndpoint: `/dashboard/metrics${period ? `?period=${period}` : ""}`,
    });
  }

  // ===== SOCIAL MEDIA CAMPAIGNS =====

  async getSocialCampaigns() {
    return this.request("GET", "/social/campaigns", undefined, {
      fallbackEndpoint: "/social/campaigns",
    });
  }

  async createSocialCampaign(data: {
    title: string;
    platforms: string[];
    content: string;
    schedule?: string;
  }) {
    return this.request("POST", "/social/campaigns", data, {
      fallbackEndpoint: "/social/campaigns",
    });
  }

  // ===== TELEMETRY / LOGGING =====

  subscribeTelemetry(
    onMessage: (data: unknown) => void,
    onError?: (err: Error) => void
  ) {
    const eventSourceUrl = `${this.config.baseUrl}/telemetry/stream`;

    try {
      const es = new EventSource(eventSourceUrl);
      es.onmessage = (event) => onMessage(JSON.parse(event.data));
      es.onerror = () => {
        es.close();
        if (onError) onError(new Error("Telemetry connection closed"));
      };
      return () => es.close();
    } catch {
      const fallbackUrl = `/api/telemetry/stream`;
      const es = new EventSource(fallbackUrl);
      es.onmessage = (event) => onMessage(JSON.parse(event.data));
      es.onerror = () => {
        es.close();
        if (onError) onError(new Error("Telemetry connection closed"));
      };
      return () => es.close();
    }
  }

  // ===== HEALTH CHECK =====

  async healthCheck(): Promise<boolean> {
    try {
      await this.request("GET", "/health", undefined, { timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let synthiaClient: SynthiaAPIClient | null = null;

export function getSynthiaClient(config?: Partial<SynthiaConfig>): SynthiaAPIClient {
  if (!synthiaClient) {
    synthiaClient = new SynthiaAPIClient(config);
  }
  return synthiaClient;
}

// Convenience function for creating new instances
export function createSynthiaClient(config?: Partial<SynthiaConfig>): SynthiaAPIClient {
  return new SynthiaAPIClient(config);
}
