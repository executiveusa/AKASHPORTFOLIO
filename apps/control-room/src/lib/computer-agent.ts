/**
 * Computer-using agent for Kupuri Media™
 * Playwright-based browser automation — agents get their own browser
 * Used by freelance-hunter when direct APIs are unavailable
 */

// Dynamic import so this module doesn't fail at build time on Vercel
// (playwright is only available on servers where it's explicitly installed)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let playwrightModule: any = null;
async function getPlaywright() {
  if (!playwrightModule) {
    playwrightModule = await import('playwright').catch(() => null);
  }
  return playwrightModule;
}

type Browser = { newContext: (opts?: object) => Promise<BrowserContext>; close: () => Promise<void> };
type BrowserContext = { newPage: () => Promise<Page>; close: () => Promise<void> };
type Page = {
  goto: (url: string, opts?: object) => Promise<unknown>;
  innerText: (selector: string) => Promise<string>;
  $$eval: (selector: string, fn: (els: Element[]) => unknown) => Promise<unknown>;
  click: (selector: string) => Promise<void>;
  fill: (selector: string, value: string) => Promise<void>;
  screenshot: (opts?: object) => Promise<Buffer>;
  setDefaultTimeout: (timeout: number) => void;
};

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
    const pw = await getPlaywright();
    if (!pw) throw new Error('playwright is not installed on this server');
    this.browser = await pw.chromium.launch({ headless: this.options.headless });
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
