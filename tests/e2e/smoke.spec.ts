import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const criticalPages = ['/', '/start', '/tools', '/guides'];
const upstreamUtilityRedirects = [
  { source: '/repeater_name_tool', destination: '/tools/repeater-name' },
  { source: '/companion_name_tool', destination: '/tools/companion-name' },
  { source: '/prefix_matrix', destination: '/tools/prefix-matrix' },
  { source: '/serial_usb_tool', destination: '/tools/serial-usb' },
] as const;
function mockCoreScopeAnalyzer(page: Page) {
  const generatedAt = '2026-05-09T12:00:00.000Z';
  const nodes = [
    {
      id: 'node-a10f-1',
      public_key: 'A10F000000000000000000000000000000000000000000000000000000000000000',
      name: 'DEN-TEST-A',
      role: 'companion',
      last_heard: generatedAt,
    },
    {
      id: 'node-a10f-2',
      public_key: 'A10F111111111111111111111111111111111111111111111111111111111111111',
      name: 'DEN-TEST-B',
      role: 'node',
      last_heard: generatedAt,
    },
  ];

  return Promise.all([
    page.route((url) => url.pathname === '/api/nodes', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ nodes, total: nodes.length }),
      });
    }),
    page.route((url) => url.pathname === '/api/stats', async (route) => {
      await route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          totalNodes: nodes.length,
          totalObservers: 0,
          totalPackets: 12,
          packetsLastHour: 4,
          packetsLast24h: 12,
          counts: { repeaters: 0, rooms: 0, companions: 1, sensors: 0 },
        }),
      });
    }),
  ]);
}

test.describe('critical page smoke', () => {
  for (const pagePath of criticalPages) {
    test(`loads ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      await expect(page.locator('body')).toBeVisible();
      await expect(page).toHaveTitle(/Colorado MeshCore/);
    });
  }

  test('start page exposes Get Started heading and three balanced journey paths', async ({ page }) => {
    await page.goto('/start');

    await expect(page.getByRole('heading', { level: 1, name: /Get Started/i })).toBeVisible();

    const main = page.locator('#main-content');

    for (const audience of ['Newcomer', 'Operator', 'Community']) {
      await expect(main.getByText(audience, { exact: true }).first()).toBeVisible();
    }

    await expect(main.getByRole('link', { name: /Getting started guide/i }).first()).toBeVisible();
    await expect(main.getByRole('link', { name: /Open operator tools/i }).first()).toBeVisible();
    await expect(main.getByRole('link', { name: /About the project/i }).first()).toBeVisible();

    await expect(main.locator('a[href="/map"]').first()).toBeVisible();
    await expect(main.locator('a[href="/tools"]').first()).toBeVisible();
    await expect(main.locator('a[href="/guides/repeater-setup"]').first()).toBeVisible();
    await expect(main.locator('a[href="/about"]').first()).toBeVisible();

    const discordLink = main.locator('a[href*="discord"]').first();
    await expect(discordLink).toBeVisible();
    await expect(discordLink).toHaveAttribute('target', '_blank');
    await expect(discordLink).toHaveAttribute('rel', /noopener/);
  });

  test('site icon metadata points at same-origin Colorado Mesh derivatives and excludes legacy /brand/linux and /brand/win paths', async ({ page }) => {
    await page.goto('/');

    const iconHrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="shortcut icon"]')).map(
        (link) => (link as HTMLLinkElement).getAttribute('href') ?? '',
      ),
    );

    expect(iconHrefs.length).toBeGreaterThan(0);
    for (const href of iconHrefs) {
      expect(href.startsWith('/')).toBe(true);
      expect(href).not.toContain('/brand/linux/');
      expect(href).not.toContain('/brand/win/');
    }
    expect(iconHrefs).toEqual(expect.arrayContaining([
      expect.stringMatching(/\/favicon\.ico/),
      expect.stringMatching(/\/favicon-16x16\.png/),
      expect.stringMatching(/\/favicon-32x32\.png/),
      expect.stringMatching(/\/apple-touch-icon\.png/),
      expect.stringMatching(/\/brand\/color\/mesh-color-256\.png/),
    ]));

    const assetChecks = await page.evaluate(async (paths: string[]) => {
      const results: Array<{ path: string; status: number | null; type: string | null }> = [];
      for (const path of paths) {
        try {
          const response = await fetch(path, { method: 'HEAD' });
          results.push({
            path,
            status: response.status,
            type: response.headers.get('content-type'),
          });
        } catch {
          results.push({ path, status: null, type: null });
        }
      }
      return results;
    }, [
      '/favicon.ico',
      '/favicon-16x16.png',
      '/favicon-32x32.png',
      '/apple-touch-icon.png',
      '/brand/color/mesh-color-256.png',
    ]);

    for (const { path, status, type } of assetChecks) {
      expect(status, `expected 200 for ${path}`).toBe(200);
      const contentType = (type || '').toLowerCase();
      if (path.endsWith('.ico')) {
        expect(
          contentType.includes('icon') || contentType.includes('image/'),
          `unexpected content-type for ${path}: ${contentType}`,
        ).toBe(true);
      } else {
        expect(contentType).toContain('image/png');
      }
    }
  });

  test('tools hub exposes all four operator tools as first-class entries', async ({ page }) => {
    await page.goto('/tools');
    const main = page.locator('#main-content');

    const toolHrefs = [
      '/tools/repeater-name',
      '/tools/companion-name',
      '/tools/prefix-matrix',
      '/tools/serial-usb',
    ];

    for (const href of toolHrefs) {
      await expect(main.locator(`a[href="${href}"]`).first()).toBeVisible();
    }

    await expect(main.locator('a[href="/map"]').first()).toBeVisible();
    await expect(main.locator('a[href="/guides/repeater-setup"]').first()).toBeVisible();
    await expect(main.getByText(/Utility defaults are generated from/i)).toBeVisible();

    const upstreamLink = main.getByRole('link', { name: 'Colorado-Mesh/meshcore-utilities-site' });
    await expect(upstreamLink).toBeVisible();
    await expect(upstreamLink).toHaveAttribute('target', '_blank');
    await expect(upstreamLink).toHaveAttribute('rel', /noopener/);
  });

  for (const { source, destination } of upstreamUtilityRedirects) {
    test(`redirects upstream utility path ${source} to ${destination}`, async ({ page }) => {
      await page.goto(source);
      await expect(page).toHaveURL(new RegExp(`${destination.replaceAll('/', '\\/')}$`));
      await expect(page.locator('#main-content')).toBeVisible();
    });
  }

  test('guides hub exposes all guide pages and a tools handoff', async ({ page }) => {
    await page.goto('/guides');
    const main = page.locator('#main-content');

    const guideHrefs = [
      '/guides/getting-started',
      '/guides/radio-settings',
      '/guides/repeater-setup',
      '/guides/observer-mqtt',
      '/guides/naming-standard',
      '/guides/troubleshooting',
    ];

    for (const href of guideHrefs) {
      await expect(main.locator(`a[href="${href}"]`).first()).toBeVisible();
    }

    const toolHandoffHrefs = [
      '/tools/repeater-name',
      '/tools/companion-name',
      '/tools/prefix-matrix',
      '/tools/serial-usb',
    ];

    for (const href of toolHandoffHrefs) {
      await expect(main.locator(`a[href="${href}"]`).first()).toBeVisible();
    }

    await expect(main.locator('a[href="/tools"]').first()).toBeVisible();
  });

  test('observer guide documents the Companion-only Colorado MQTT path', async ({ page }) => {
    await page.goto('/guides/observer-mqtt');
    const main = page.locator('#main-content');

    await expect(
      main.getByRole('heading', { level: 1, name: /mesh's ears/i }),
    ).toBeVisible();
    await expect(main.getByText('mqtt.meshcore.coloradomesh.org').first()).toBeVisible();
    await expect(main.getByText('TOML · meshcore-packet-capture · Companion only')).toBeVisible();

    const brokerConfig = main.locator('pre').filter({ hasText: 'name = "Colorado Mesh"' });
    await expect(brokerConfig).toContainText('port = 1883');
    await expect(brokerConfig).toContainText('transport = "websockets"');
    await expect(brokerConfig).toContainText('[broker.tls]');
    await expect(brokerConfig).toContainText('method = "token"');
    await expect(brokerConfig).toContainText('audience = "mqtt.meshcore.coloradomesh.org"');
    await expect(main.getByText(/Contents stay encrypted/i)).toBeVisible();
    await expect(main.getByText(/without removing any existing broker entries/i)).toBeVisible();

    const installer = main.locator('pre').filter({ hasText: '--tag v2.0.0' });
    await expect(installer).toContainText('42521260a92feec9ea806eebe1249acde0ef2a7f');
    await expect(main.getByRole('link', { name: /Observer status/i })).toHaveAttribute(
      'href',
      'https://analyzer.meshcore.coloradomesh.org/#/observers',
    );
  });

  test('serial-usb tool previews settings JSON and disables Apply without a connection', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'serial', {
        configurable: true,
        get: () => undefined,
      });
    });
    await page.goto('/tools/serial-usb');
    await expect(page.getByRole('heading', { name: /USB serial/i })).toBeVisible();

    await expect(page.getByTestId('serial-support-banner')).toContainText('Web Serial not available');
    await expect(page.getByTestId('serial-support-status')).toContainText('Unavailable in this browser');
    await expect(page.getByTestId('serial-connect')).toBeDisabled();

    const input = page.getByTestId('serial-settings-input');
    await expect(input).toBeVisible();

    const settingsJson = JSON.stringify({
      name: 'DEN-GLDN-LKVST-RC-A10F',
      radio_settings: { tx_power: 22 },
    });
    await input.fill(settingsJson);

    const preview = page.getByTestId('serial-settings-preview');
    await expect(preview).toBeVisible();
    await expect(preview).toContainText('set name DEN-GLDN-LKVST-RC-A10F');
    await expect(preview).toContainText('set tx 22');

    const apply = page.getByTestId('serial-settings-apply');
    await expect(apply).toBeDisabled();
    await expect(page.getByText('Connect a device above to enable Apply.')).toBeVisible();

    await input.fill('{not json');
    await expect(page.getByTestId('serial-settings-error')).toBeVisible();
    await expect(apply).toBeDisabled();
  });

  test('prefix-matrix page exposes search, suggestion, and 4-char grid', async ({ page }) => {
    await mockCoreScopeAnalyzer(page);
    await page.goto('/tools/prefix-matrix');
    await expect(page.getByRole('heading', { name: /prefix matrix/i })).toBeVisible();

    const summary = page.getByTestId('prefix-matrix-summary');
    await expect(summary).toBeVisible({ timeout: 15_000 });
    await expect(summary).toContainText('occupied 4-char prefixes');

    const search = page.getByTestId('prefix-matrix-search');
    await expect(search).toBeVisible();
    await search.fill('00');

    const suggest = page.getByTestId('prefix-matrix-suggest');
    await expect(suggest).toBeEnabled();
    await search.fill('');
    await suggest.focus();
    await page.keyboard.press('Enter');

    const detail = page.getByTestId('prefix-matrix-detail');
    await expect(detail).toBeVisible({ timeout: 10_000 });

    await page.getByTestId('prefix-matrix-primary-A1').focus();
    await page.keyboard.press('Enter');
    await page.getByTestId('prefix-matrix-secondary-A10F').focus();
    await page.keyboard.press('Enter');
    await expect(detail).toContainText('nodes share 0xA10F');

    await page.getByTestId('prefix-matrix-primary-00').focus();
    await page.keyboard.press('Enter');
    await page.getByTestId('prefix-matrix-secondary-0000').focus();
    await page.keyboard.press('Enter');
    await expect(detail).toContainText('Reserved prefix');
  });
});

const interactiveToolPages = [
  '/tools/repeater-name',
  '/tools/companion-name',
  '/tools/prefix-matrix',
  '/tools/serial-usb',
];

const representativeDetailPages = [
  '/guides/getting-started',
  '/guides/repeater-setup',
  '/guides/observer-mqtt',
  '/blog/network-expansion-2026',
];

test.describe('critical page accessibility @a11y', () => {
  for (const pagePath of criticalPages) {
    test(`has no detectable axe violations on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('interactive tool smoke', () => {
  for (const pagePath of interactiveToolPages) {
    test(`loads ${pagePath} with a main heading and main landmark`, async ({ page }) => {
      if (pagePath === '/tools/serial-usb') {
        await page.addInitScript(() => {
          Object.defineProperty(Navigator.prototype, 'serial', {
            configurable: true,
            get: () => undefined,
          });
        });
      }
      if (pagePath === '/tools/prefix-matrix') {
        await mockCoreScopeAnalyzer(page);
      }
      await page.goto(pagePath);
      await expect(page.locator('#main-content')).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }

  test('repeater-name wizard surfaces map snapshot inputs and outputs', async ({ page }) => {
    await mockCoreScopeAnalyzer(page);
    await page.goto('/tools/repeater-name');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    const main = page.locator('#main-content');
    await expect(main.getByRole('textbox').first()).toBeVisible();
  });

  test('companion-name builder accepts a single emoji grapheme', async ({ page }) => {
    await page.goto('/tools/companion-name');
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
    const emoji = page.getByLabel('Emoji', { exact: true });
    await expect(emoji).toBeVisible();
    await emoji.fill('👻');
    await expect(emoji).toHaveValue('👻');
  });

  test('prefix-matrix grid cells expose accessible names', async ({ page }) => {
    await mockCoreScopeAnalyzer(page);
    await page.goto('/tools/prefix-matrix');
    const grid = page.getByRole('grid', { name: /First-byte prefix matrix/i });
    await expect(grid).toBeVisible({ timeout: 15_000 });
    const primaryCell = page.getByTestId('prefix-matrix-primary-A1');
    await expect(primaryCell).toBeVisible();
    await expect(primaryCell).toHaveAttribute('aria-label', /A1/);
    await expect(primaryCell).toHaveAttribute('aria-selected', /true|false/);
  });
});

test.describe('interactive tool accessibility @a11y', () => {
  for (const pagePath of interactiveToolPages) {
    test(`has no detectable axe violations on ${pagePath}`, async ({ page }) => {
      if (pagePath === '/tools/serial-usb') {
        await page.addInitScript(() => {
          Object.defineProperty(Navigator.prototype, 'serial', {
            configurable: true,
            get: () => undefined,
          });
        });
      }
      if (pagePath === '/tools/prefix-matrix') {
        await mockCoreScopeAnalyzer(page);
      }
      await page.goto(pagePath);
      const results = await new AxeBuilder({ page })
        .disableRules(['color-contrast'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('representative detail page smoke', () => {
  for (const pagePath of representativeDetailPages) {
    test(`loads ${pagePath} with a main heading and main landmark`, async ({ page }) => {
      await page.goto(pagePath);
      await expect(page.locator('#main-content')).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();
    });
  }
});

test.describe('representative detail page accessibility @a11y', () => {
  for (const pagePath of representativeDetailPages) {
    test(`has no detectable axe violations on ${pagePath}`, async ({ page }) => {
      await page.goto(pagePath);
      const results = await new AxeBuilder({ page })
        .disableRules(['color-contrast'])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});

const PRIMARY_NAV_LABELS = [
  'Get Started',
  'Live Map',
  'Tools',
  'Guides',
  'Learn',
  'About',
] as const;

const ACTIVE_NAV_CASES: ReadonlyArray<{ route: string; label: string }> = [
  { route: '/map', label: 'Live Map' },
  { route: '/tools/repeater-name', label: 'Tools' },
  { route: '/guides/getting-started', label: 'Guides' },
  { route: '/blog', label: 'Learn' },
];

test.describe('global navigation', () => {
  test('header exposes the approved primary nav labels', async ({ page }) => {
    await page.goto('/');
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    for (const label of PRIMARY_NAV_LABELS) {
      await expect(mainNav.getByRole('link', { name: label, exact: true })).toBeVisible();
    }
  });

  for (const { route, label } of ACTIVE_NAV_CASES) {
    test(`marks "${label}" as current on ${route}`, async ({ page }) => {
      await page.goto(route);
      const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
      const currentLinks = mainNav.locator('a[aria-current="page"]');
      await expect(currentLinks).toHaveCount(1);
      await expect(currentLinks.first()).toHaveText(label);
    });
  }

  test('does not mark any header link active on an unmatched route', async ({ page }) => {
    await page.goto('/');
    const mainNav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(mainNav.locator('a[aria-current="page"]')).toHaveCount(0);
  });

  test('mobile menu opens, lists primary nav, and closes on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await mockCoreScopeAnalyzer(page);
    await page.goto('/', { waitUntil: 'networkidle' });

    const openButton = page.getByRole('button', { name: /Open main menu/i });
    await expect(openButton).toBeVisible();
    await expect(openButton).toHaveAttribute('aria-expanded', 'false');

    const dialog = page.locator('#mobile-menu');
    await expect(dialog).toHaveAttribute('aria-hidden', 'true');

    await openButton.click();
    await expect(openButton).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog).toHaveAttribute('aria-hidden', 'false');
    await expect(page.getByRole('button', { name: /Close menu/i })).toBeFocused();
    for (const label of PRIMARY_NAV_LABELS) {
      await expect(dialog.getByRole('link', { name: label, exact: true })).toBeVisible();
    }

    await page.keyboard.press('Escape');
    await expect(openButton).toHaveAttribute('aria-expanded', 'false');
    await expect(dialog).toHaveAttribute('aria-hidden', 'true');
  });

  test('skip link focuses first and points to main content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#main-content')).toBeAttached();

    await page.keyboard.press('Tab');
    const skipLink = page.getByTestId('skip-to-main');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toHaveAttribute('href', '#main-content');

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });
});
