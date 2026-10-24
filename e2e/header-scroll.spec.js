const { test, expect } = require('@playwright/test');

test('Header Scroll and Sticky Behavior', async ({ page }) => {
    await page.goto('/');

    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header).toHaveCSS('position', 'sticky');

    // Scroll up the page
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(300); 
    await expect(header).toHaveClass(/-translate-y-full/);

    // Scroll down the page
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300); 
    await expect(header).toHaveClass(/translate-y-0/);
});