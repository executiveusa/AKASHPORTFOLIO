/**
 * CODE_MODE Client — Routes API calls to PAID (Anthropic) or FREE (local proxy)
 *
 * Automatically switches between:
 * - PAID: Anthropic API (claude-3.5-sonnet)
 * - FREE: Local proxy (http://localhost:8082) → Ollama/LM Studio/OpenRouter
 */

export type CodeMode = 'PAID' | 'FREE';

interface CodeModeConfig {
  activeMode: CodeMode;
  paidEndpoint: string;
  freeEndpoint: string;
  fallbackEndpoints: string[];
}

const DEFAULT_CONFIG: CodeModeConfig = {
  activeMode: (process.env.CODE_MODE as CodeMode) || 'PAID',
  paidEndpoint: 'https://api.anthropic.com/v1',
  freeEndpoint: 'http://localhost:8082',
  fallbackEndpoints: [
    'http://localhost:11434', // Ollama
    'http://localhost:1234',  // LM Studio
  ],
};

export class CodeModeClient {
  private config: CodeModeConfig;

  constructor(config: Partial<CodeModeConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get current mode
   */
  getMode(): CodeMode {
    return this.config.activeMode;
  }

  /**
   * Switch between modes at runtime
   */
  setMode(mode: CodeMode): void {
    this.config.activeMode = mode;
    console.log(`[CodeMode] Switched to ${mode} mode`);
  }

  /**
   * Get endpoint for current mode
   */
  getEndpoint(): string {
    if (this.config.activeMode === 'PAID') {
      return this.config.paidEndpoint;
    }
    return this.config.freeEndpoint;
  }

  /**
   * Get authorization header for current mode
   */
  getAuthHeader(): Record<string, string> {
    if (this.config.activeMode === 'PAID') {
      return {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      };
    }
    // FREE mode doesn't require auth (local proxy)
    return {};
  }

  /**
   * Verify FREE mode proxy is available
   */
  async verifyFreeMode(): Promise<boolean> {
    if (this.config.activeMode !== 'FREE') {
      return true;
    }

    try {
      const response = await fetch(`${this.config.freeEndpoint}/health`, {
        timeout: 3000,
      });
      return response.ok;
    } catch {
      console.warn('[CodeMode] FREE mode proxy unavailable, fallback to PAID');
      return false;
    }
  }

  /**
   * Proxy API call through appropriate endpoint
   */
  async proxyRequest(
    path: string,
    options: RequestInit & { apiVersion?: string }
  ): Promise<Response> {
    const endpoint = this.getEndpoint();
    const headers = {
      ...options.headers,
      ...this.getAuthHeader(),
    };

    const url = `${endpoint}${path}`;

    if (this.config.activeMode === 'PAID') {
      // Add Anthropic-specific headers
      headers['anthropic-version'] = options.apiVersion || '2023-06-01';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // If FREE mode fails, fallback to PAID
      if (
        this.config.activeMode === 'FREE' &&
        (response.status === 503 || response.status === 500)
      ) {
        console.warn(
          '[CodeMode] FREE mode failed, falling back to PAID mode'
        );
        this.setMode('PAID');
        return this.proxyRequest(path, options);
      }

      return response;
    } catch (error) {
      // Network error in FREE mode → fallback
      if (this.config.activeMode === 'FREE') {
        console.error('[CodeMode] FREE mode network error, switching to PAID');
        this.setMode('PAID');
        return this.proxyRequest(path, options);
      }
      throw error;
    }
  }

  /**
   * Get cost estimate for operation
   */
  getCostEstimate(inputTokens: number, outputTokens: number): {
    mode: CodeMode;
    costUSD: number;
    estimatedTime: number;
  } {
    if (this.config.activeMode === 'PAID') {
      // Anthropic pricing: $3/MTok input, $15/MTok output
      const inputCost = (inputTokens / 1_000_000) * 3;
      const outputCost = (outputTokens / 1_000_000) * 15;
      return {
        mode: 'PAID',
        costUSD: inputCost + outputCost,
        estimatedTime: 450, // ms
      };
    }

    // FREE mode: $0 cost
    return {
      mode: 'FREE',
      costUSD: 0,
      estimatedTime: 1200, // ms (slower)
    };
  }

  /**
   * Get status summary
   */
  async getStatus(): Promise<{
    activeMode: CodeMode;
    endpoint: string;
    available: boolean;
    fallbackActive: boolean;
  }> {
    const available = await this.verifyFreeMode();
    const isFallback = this.config.activeMode === 'FREE' && !available;

    return {
      activeMode: this.config.activeMode,
      endpoint: this.getEndpoint(),
      available,
      fallbackActive: isFallback,
    };
  }
}

/**
 * Singleton instance
 */
let client: CodeModeClient | null = null;

export function getCodeModeClient(): CodeModeClient {
  if (!client) {
    client = new CodeModeClient();
  }
  return client;
}

/**
 * Helper: Format mode status for UI
 */
export function formatCodeModeStatus(
  mode: CodeMode,
  available: boolean
): string {
  if (mode === 'PAID') {
    return available ? '💳 PAID (Anthropic)' : '⚠️ PAID (Offline)';
  }
  return available
    ? '🎉 FREE (Local Proxy)'
    : '⚠️ FREE (Proxy unavailable, fallback to PAID)';
}
