import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const criticalPages = ['/', '/map', '/tools'];

test.describe('critical page smoke', () => {
  for (const pagePath of criticalPages) {
    test(`loads ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      await expect(page.locator('body')).toBeVisible();
      await expect(page).toHaveTitle(/Colorado MeshCore/);
    });
  }

  test('map page renders diagnostics and operator copy', async ({ page }) => {
    await page.goto('/map');
    await expect(page.getByText(/\/api\/map\/snapshot/)).toBeVisible();
    await expect(page.getByText(/\/api\/live-map\/\*/)).toBeVisible();
    const diagnostics = page.getByTestId('map-diagnostics');
    await expect(diagnostics).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('critical page accessibility @a11y', () => {
  for (const pagePath of criticalPages) {
    test(`has no detectable axe violations on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
