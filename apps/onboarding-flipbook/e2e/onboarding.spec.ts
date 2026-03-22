import { test, expect, Page } from '@playwright/test';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Navigate to the flipbook and wait for Bevy canvas to appear. */
async function loadFlibook(page: Page) {
  const consoleErrors: string[] = [];

  // Register error listener BEFORE navigation so we catch boot errors too
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`[pageerror] ${err.message}`);
  });

  await page.goto('/');

  // Wait for Bevy to inject + paint the canvas (WASM init)
  await expect(page.locator('canvas')).toBeAttached({ timeout: 15_000 });

  return { consoleErrors };
}

/** Simulate a horizontal drag across the canvas (opens book cover). */
async function dragCover(page: Page, fromX: number, toX: number, y = 300) {
  await page.mouse.move(fromX, y);
  await page.mouse.down();
  await page.mouse.move(toX, y, { steps: 20 });
  await page.mouse.up();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe('onboarding-flipbook WASM sidecar', () => {

  test('canvas renders without WASM panic', async ({ page }) => {
    const { consoleErrors } = await loadFlibook(page);

    // Canvas present
    await expect(page.locator('canvas')).toBeVisible();

    // Loading overlay should disappear after WASM boots
    await expect(page.locator('#loading')).toHaveClass(/hidden/, { timeout: 12_000 });

    // HUD visible
    await expect(page.locator('#ui-layer')).toBeVisible();

    // No JS / WASM errors
    expect(
      consoleErrors.filter((e) => !e.includes('autoplay')).join('\n'),
    ).toBe('');
  });

  test('book opens on mouse drag — cover rotates, UI updates', async ({ page }) => {
    await loadFlibook(page);

    const viewport = page.viewportSize()!;
    const midY = viewport.height / 2;

    // Drag left-to-right to open the cover
    await dragCover(page, viewport.width * 0.15, viewport.width * 0.75, midY);

    // Give snap physics ~600ms to settle
    await page.waitForTimeout(600);

    // Progress dots: after opening, at least dot-1 or dot-2 should be active/done
    const activeDot = page.locator('.dot.active, .dot.done');
    await expect(activeDot.first()).toBeVisible();

    // Drag hint should have disappeared when interaction started
    await expect(page.locator('#drag-hint')).toHaveClass(/hidden/);
  });

  test('continue button appears when fully open', async ({ page }) => {
    await loadFlibook(page);

    const viewport = page.viewportSize()!;
    const midY = viewport.height / 2;

    // Full drag across entire viewport to max-open the book
    await dragCover(page, viewport.width * 0.05, viewport.width * 0.95, midY);

    // Wait for snap + 400ms debounce on the CTA
    await page.waitForTimeout(1_200);

    await expect(page.locator('#btn-continuar')).toHaveClass(/visible/, {
      timeout: 3_000,
    });
  });

  test('video overlay appears after 50% open threshold', async ({ page }) => {
    await loadFlibook(page);

    const viewport = page.viewportSize()!;

    // Drag to ~60% open
    await dragCover(page, viewport.width * 0.1, viewport.width * 0.65, viewport.height / 2);
    await page.waitForTimeout(400);

    // The video overlay container should become visible
    // (video src may be empty in CI — we only check the CSS state, not playback)
    await expect(page.locator('#video-overlay')).toHaveClass(/visible/, {
      timeout: 3_000,
    });
  });

  test('continue button triggers localStorage and onboarding:complete event', async ({ page }) => {
    await loadFlibook(page);

    const viewport = page.viewportSize()!;

    // Open fully
    await dragCover(page, viewport.width * 0.05, viewport.width * 0.95, viewport.height / 2);
    await page.waitForTimeout(1_200);

    // Intercept the custom event before clicking
    const eventPromise = page.evaluate(() =>
      new Promise<boolean>((resolve) => {
        window.addEventListener(
          'onboarding:complete',
          () => resolve(true),
          { once: true },
        );
        // If SPA nav would redirect, prevent it for testing
        (window as any).__kupuri_spa = true;
        setTimeout(() => resolve(false), 3_000);
      }),
    );

    await page.locator('#btn-continuar').click();

    const fired = await eventPromise;
    expect(fired).toBe(true);

    // localStorage key set
    const stored = await page.evaluate(
      () => localStorage.getItem('kupuri_onboarding_seen'),
    );
    expect(stored).toBe('true');
  });

  test('no glassmorphism — backdrop-filter must not appear in computed styles', async ({ page }) => {
    await loadFlibook(page);

    // Check the HUD panel — should not have backdrop-filter
    const backdropFilter = await page.locator('#ui-layer').evaluate((el) =>
      getComputedStyle(el).backdropFilter,
    );
    expect(backdropFilter).toBe('none');
  });
});

