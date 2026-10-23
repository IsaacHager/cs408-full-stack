const { test, expect } = require('@playwright/test');

test.describe('CanvasDesk App Flow Core Integration Tests', () => {
  
    test('should load app view canvas and wait for API text delivery', async ({ page }) => {
        await page.goto('/');

        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('header')).toContainText('CanvasDesk');
        await expect(page.locator('aside.sidebar')).toBeVisible();

        const contentMessage = page.locator('main p');
        await expect(contentMessage).toBeVisible();
        
        await expect(contentMessage).not.toHaveText('Loading...', { timeout: 5000 });
    });
});