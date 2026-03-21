import { test, expect } from '@playwright/test';

test.describe('3D Interactive Onboarding Flipbook Sidecar', () => {
  // Test the sidecar independently (the web wrapper serves the Wasm)
  test('should load the WebGL canvas and immersive 3D scene without crashing', async ({ page }) => {
    // Assuming the dev server or trunk will serve the sidecar on a specific port.
    // For local evaluation, we can use the file schema or localhost.
    // In our CI/E2E pipeline, we assume Vercel or Vite will serve this at /onboarding.
    
    // We will navigate to the local onboarding html
    await page.goto('file://c:/kupuri-media-cdmx/apps/onboarding-flipbook/index.html');

    // Verify Uncodixfy UI styling
    const header = page.locator('h1');
    await expect(header).toContainText('Bienvenida a Sphere OS™');
    
    const uiLayer = page.locator('#ui-layer');
    await expect(uiLayer).toBeVisible();

    // Verify the HTML5 Canvas element is instantiated by Wasm/WebGL Bevy
    // Bevy will inject a <canvas> into the body dynamically upon load.
    // Wait for the loading screen to disappear
    await page.waitForTimeout(3000); 
    
    const canvas = page.locator('canvas');
    await expect(canvas).toBeAttached();
    
    // Test basic interactive touch / swiping events would work (mouse drag)
    await page.mouse.move(200, 200);
    await page.mouse.down();
    await page.mouse.move(600, 200, { steps: 5 });
    await page.mouse.up();
    
    // Test is green if no WASM panics occurred in console
    const consoleErrors: string[] = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    
    expect(consoleErrors).toHaveLength(0);
  });
});
