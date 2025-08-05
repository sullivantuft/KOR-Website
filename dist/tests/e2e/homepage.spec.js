/**
 * End-to-End Tests for KOR Website Homepage
 */

const { test, expect } = require('@playwright/test');

test.describe('KOR Homepage E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to your local site - adjust URL as needed
    await page.goto('http://localhost:8080');
  });

  test('homepage should load correctly', async ({ page }) => {
    // Check the page title
    await expect(page).toHaveTitle(/KOR/);

    // Check that key elements are visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('navigation should work properly', async ({ page }) => {
    // Test navigation to different sections
    await page.click('nav a[href="#services"]');
    await expect(page.locator('#services')).toBeInViewport();

    await page.click('nav a[href="#contact"]');
    await expect(page.locator('#contact')).toBeInViewport();
  });

  test('contact form should work', async ({ page }) => {
    // Navigate to contact section
    await page.click('nav a[href="#contact"]');

    // Fill out the form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '123-456-7890');
    await page.fill('textarea[name="message"]', 'This is a test message');

    // Submit the form
    await page.click('button[type="submit"]');

    // Check for success message or appropriate response
    await expect(page.locator('.form-success')).toBeVisible({ timeout: 5000 });
  });

  test('responsive design works on mobile', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Check that mobile menu toggle is visible
    await expect(page.locator('.mobile-menu-toggle')).toBeVisible();

    // Test mobile menu functionality
    await page.click('.mobile-menu-toggle');
    await expect(page.locator('nav')).toHaveClass(/mobile-open/);
  });

  test('performance: page should load quickly', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('http://localhost:8080');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('accessibility: basic checks', async ({ page }) => {
    // Check for alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for form labels
    const inputs = page.locator('input, textarea, select');
    const inputCount = await inputs.count();

    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        await expect(label).toBeVisible();
      }
    }
  });

  test('service worker should be registered', async ({ page }) => {
    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator;
    });
    expect(swRegistered).toBe(true);
  });

  test('lazy loading images work', async ({ page }) => {
    // Scroll to trigger lazy loading
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for images to load
    await page.waitForTimeout(2000);

    // Check that lazy-loaded images have src attribute
    const lazyImages = page.locator('img[data-src]');
    const count = await lazyImages.count();

    for (let i = 0; i < count; i++) {
      const img = lazyImages.nth(i);
      const src = await img.getAttribute('src');
      expect(src).toBeTruthy();
    }
  });
});
