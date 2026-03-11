/**
 * Computer-using agent for Kupuri Media™
 * Playwright-based browser automation — agents get their own browser
 * Used by freelance-hunter when direct APIs are unavailable
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';

export interface AgentBrowserOptions {
  headless?: boolean;
  timeout?: number;
  userAgent?: string;
}

export interface PageSnapshot {
  url: string;
  title: string;
  text: string;       // Visible text, trimmed
  screenshot?: Buffer;
}

export class ComputerAgent {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  private options: Required<AgentBrowserOptions> = {
    headless: true,
    timeout: 15000,
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  };

  constructor(options: AgentBrowserOptions = {}) {
    this.options = { ...this.options, ...options };
  }

  async launch(): Promise<void> {
    this.browser = await chromium.launch({ headless: this.options.headless });
    this.context = await this.browser.newContext({
      userAgent: this.options.userAgent,
      locale: 'es-MX',
      timezoneId: 'America/Mexico_City',
    });
    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(this.options.timeout);
  }

  private ensurePage(): Page {
    if (!this.page) throw new Error('ComputerAgent not launched. Call launch() first.');
    return this.page;
  }

  /**
   * Navigate to a URL and wait for the page to be ready
   */
  async navigateTo(url: string): Promise<void> {
    await this.ensurePage().goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Extract all visible text from the page
   */
  async extractText(selector = 'body'): Promise<string> {
    const text = await this.ensurePage().innerText(selector).catch(() => '');
    return text.replace(/\s+/g, ' ').trim().slice(0, 10000);
  }

  /**
   * Extract text content of multiple elements matching a selector
   */
  async extractList(selector: string): Promise<string[]> {
    return this.ensurePage().$$eval(selector, (els) =>
      els.map((el) => (el as HTMLElement).innerText?.trim() ?? '').filter(Boolean)
    );
  }

  /**
   * Click an element
   */
  async clickElement(selector: string): Promise<void> {
    await this.ensurePage().click(selector);
  }

  /**
   * Type text into an input
   */
  async typeInto(selector: string, text: string): Promise<void> {
    await this.ensurePage().fill(selector, text);
  }

  /**
   * Take a screenshot, returns PNG Buffer
   */
  async screenshotPage(): Promise<Buffer> {
    return this.ensurePage().screenshot({ type: 'png', fullPage: false }) as Promise<Buffer>;
  }

  /**
   * Snapshot: URL + title + visible text (+ optional screenshot)
   */
  async snapshot(includeScreenshot = false): Promise<PageSnapshot> {
    const page = this.ensurePage();
    const url = page.url();
    const title = await page.title();
    const text = await this.extractText();
    const screenshot = includeScreenshot ? await this.screenshotPage() : undefined;
    return { url, title, text, screenshot };
  }

  /**
   * Wait for an element to appear
   */
  async waitFor(selector: string, timeout?: number): Promise<void> {
    await this.ensurePage().waitForSelector(selector, {
      timeout: timeout ?? this.options.timeout,
    });
  }

  /**
   * Run a quick page scan: navigate → extract relevant content
   */
  async scanPage(url: string): Promise<PageSnapshot> {
    await this.navigateTo(url);
    return this.snapshot();
  }

  async close(): Promise<void> {
    await this.context?.close();
    await this.browser?.close();
    this.page = null;
    this.context = null;
    this.browser = null;
  }
}

/**
 * Run a one-shot browser task without manually managing lifecycle
 */
export async function withBrowser<T>(
  fn: (agent: ComputerAgent) => Promise<T>,
  options?: AgentBrowserOptions
): Promise<T> {
  const agent = new ComputerAgent(options);
  await agent.launch();
  try {
    return await fn(agent);
  } finally {
    await agent.close();
  }
}
