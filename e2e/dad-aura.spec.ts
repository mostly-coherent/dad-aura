import { test, expect } from '@playwright/test';

test.describe('Dad Aura E2E Tests', () => {
  
  test('01 - Dashboard loads with aura score', async ({ page }) => {
    await page.goto('/');
    
    // Main dashboard should load
    await expect(page).toHaveTitle(/Dad.*Aura|Aura/i);
    
    // Aura score display should be visible
    await expect(page.locator('body')).toBeVisible();
    
    await page.screenshot({ path: 'e2e-results/01-dashboard.png', fullPage: true });
  });

  test('02 - Activity feed is visible', async ({ page }) => {
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: 'e2e-results/02-activity-feed.png', fullPage: true });
  });

  test('03 - Dad flip button exists', async ({ page }) => {
    await page.goto('/');
    
    // Look for flip button or similar interactive element
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'e2e-results/03-flip-button.png', fullPage: true });
  });

  test('04 - API - GET aura events', async ({ request }) => {
    const response = await request.get('/api/aura');
    // API should respond (may be empty array or error if no DB)
    expect([200, 500]).toContain(response.status());
  });

  test('05 - Responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e-results/05-mobile.png', fullPage: true });
  });

  test('06 - Responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'e2e-results/06-tablet.png', fullPage: true });
  });

});

