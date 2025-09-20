import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './utils/serveDist';
import fs from 'fs';
import path from 'path';

const SCREEN_DIR = path.resolve(process.cwd(), 'test-results', 'e2e-screenshots');
function ensureDir() {
  try {
    fs.mkdirSync(SCREEN_DIR, { recursive: true });
  } catch (e) {}
}
async function saveScreenshot(page: any, name: string) {
  ensureDir();
  const p = path.join(SCREEN_DIR, name);
  await page.screenshot({ path: p, fullPage: false });
}

// This e2e test expects a dev server to be running at the given URL.
// It will navigate to the app, open the Admin view, and verify the dev-only
// global `window.__ADMIN_PANEL_LOADED__` is set by the lazy-loaded AdminPanel.

const BASE = process.env.E2E_BASE_URL || 'http://127.0.0.1:5173';

test.describe('Admin lazy-load', () => {
  // Helper: retry navigation a few times for flaky HMR-induced aborts
  async function navigateWithRetry(page: any, url: string, opts: any = {}, attempts = 3) {
    for (let i = 0; i < attempts; i++) {
      try {
        return await page.goto(url, opts);
      } catch (err: any) {
        const msg = String(err && err.message ? err.message : err);
        // Retry on common transient errors
        if (msg.includes('ERR_ABORTED') || msg.includes('frame was detached') || msg.includes('net::ERR_ABORTED')) {
          if (i < attempts - 1) {
            // small backoff
            await new Promise(r => setTimeout(r, 500 * (i + 1)));
            continue;
          }
        }
        throw err;
      }
    }
  }

  test.beforeAll(async () => {
    await startServer();
  });

  test.afterAll(async () => {
    await stopServer();
  });

  test('loads AdminPanel chunk when navigating to Admin', async ({ page, context }) => {
    // Seed a dev session via addInitScript so it exists before any page scripts run.
    await context.addInitScript(() => {
      try {
        // Seed an admin dev session so the app enables admin-only UI during E2E runs
        localStorage.setItem('biostack_session_v1', JSON.stringify({ uid: 'e2e-user', displayName: 'E2E User', isAnonymous: false, isAdmin: true, ts: Date.now() }));
      } catch (e) {
        // ignore write errors
      }
    });

  // Navigate and wait for the initial DOM to be ready (more robust under HMR)
  const navResponse = await navigateWithRetry(page, BASE, { waitUntil: 'domcontentloaded', timeout: 120_000 }, 4);
  // Accept either a top-level <main> or fallback to body/root for apps that render differently.
  await page.waitForSelector('main, body, [id="root"]', { timeout: 90_000 });
  // Save the navigation response status for diagnostics
  try {
    const status = navResponse && typeof navResponse.status === 'function' ? navResponse.status() : (navResponse && navResponse.status) || 'unknown';
    fs.writeFileSync(path.join(SCREEN_DIR, '00-nav-status.txt'), String(status));
  } catch (e) {
    // ignore
  }
  await saveScreenshot(page, '01-home.png');

  // Explicitly navigate to the hash route #admin so the app's hash-based router selects the admin view
  await navigateWithRetry(page, `${BASE}/#admin`, { waitUntil: 'domcontentloaded', timeout: 120_000 }, 4);
  await page.waitForSelector('main, body, [id="root"]', { timeout: 90_000 });
  await saveScreenshot(page, '02-admin-navigated.png');

    // Attempt to find a navigation item that opens the Admin view (if redirect didn't land there).
    const adminNav = page.locator('[data-testid="nav-admin"]').first();
    if (await adminNav.count() === 0) {
      // fallback to text
      const adminText = page.getByText('Admin').first();
      if (await adminText.count() > 0) await adminText.click();
    } else {
      await adminNav.click();
    }
    // If clicking didn't change the hash (app uses hash-based routing), force it to ensure view switches
    await page.evaluate(() => { try { if (!window.location.hash || window.location.hash !== '#admin') window.location.hash = '#admin'; } catch (e) {} });

    // Wait for the network and UI to settle
    await page.waitForLoadState('networkidle');

    // Diagnostic screenshot before waiting for admin chunk
    await saveScreenshot(page, '02b-admin-before-chunk-wait.png');

    // Wait explicitly for the Admin JS chunk to be requested and return successfully.
    // In the production build Vite emits hashed assets under /assets — look for 'admin' or 'adminpanel' in the filename.
    try {
      await page.waitForResponse(resp => {
        try {
          const url = resp.url().toLowerCase();
          return url.includes('/assets') && (url.includes('admin') || url.includes('adminpanel')) && resp.status() === 200;
        } catch (e) {
          return false;
        }
      }, { timeout: 120_000 });
    } catch (e) {
      // Fallback: if the app didn't request the chunk during the test run, verify the AdminPanel asset is present
      // and servable by making a direct request to the expected file in dist/assets.
      try {
        const assetsDir = path.join(process.cwd(), 'dist', 'assets');
        const files = fs.readdirSync(assetsDir);
        const adminFile = files.find(f => f.toLowerCase().startsWith('adminpanel'));
        if (adminFile) {
          const url = `${BASE}/assets/${adminFile}`;
          const r = await page.request.get(url);
          // record which asset we found for diagnostics
          try { ensureDir(); fs.writeFileSync(path.join(SCREEN_DIR, '02-admin-asset-found.txt'), String(adminFile)); } catch (w) {}
          expect(r.status()).toBe(200);
        } else {
          // If we can't find AdminPanel asset deterministically, fail the test with a helpful message.
          throw new Error('AdminPanel asset not found in dist/assets');
        }
      } catch (inner) {
        throw inner;
      }
    }

  // Poll for the dev flag that AdminPanel sets on mount
  await page.waitForFunction(() => (window as any).__ADMIN_PANEL_LOADED__ === true, null, { timeout: 60_000 });
  await saveScreenshot(page, '03-admin-loaded.png');

  const flag = await page.evaluate(() => (window as any).__ADMIN_PANEL_LOADED__ === true);
    expect(flag).toBe(true);
  });
});
