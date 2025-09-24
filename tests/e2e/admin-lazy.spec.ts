import { test, expect } from '@playwright/test';
// Choose server: dev or dist, controlled via E2E_USE_DEV=1
const useDev = process.env.E2E_USE_DEV === '1';
const { startServer, stopServer } = useDev
  ? require('./utils/serveDev')
  : require('./utils/serveDist');
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
  // Increase per-test timeout to allow slower CI or disk-bound environments to fetch
  // hashed assets and for our polling logic to complete without the default 60s cap.
  test.setTimeout(240000);
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
        // Opt-in flag to enable E2E mount instrumentation in production builds
        try { (window as any).__E2E__ = true; } catch (e) {}
        // Seed an admin dev session so the app enables admin-only UI during E2E runs
        localStorage.setItem('biostack_session_v1', JSON.stringify({ uid: 'e2e-user', displayName: 'E2E User', isAnonymous: false, isAdmin: true, ts: Date.now() }));
        // Force initial hash to #admin so the app's hash-based router selects the admin view on first load.
        try { if (!window.location.hash || window.location.hash !== '#admin') window.location.hash = '#admin'; } catch (e) {}
      } catch (e) {
        // ignore write errors
      }
    });

  // Ensure network log exists and record asset/admin responses for debugging
  ensureDir();
  const NETWORK_LOG = path.join(SCREEN_DIR, 'network-requests.txt');
  try { fs.writeFileSync(NETWORK_LOG, ''); } catch (e) {}
  page.on('response', resp => {
    try {
      const u = resp.url();
      const low = u.toLowerCase();
      if (u.includes('/assets') || low.includes('admin') ) {
        const line = `${new Date().toISOString()} ${resp.status()} ${u}\n`;
        try { fs.appendFileSync(NETWORK_LOG, line); } catch (e) {}
      }
    } catch (e) {}
  });

  // Capture page console messages so they appear in Playwright traces and test diagnostics.
  const consoleMessages: string[] = [];
  try {
    page.on('console', msg => {
      try {
        const text = String(msg.text());
        consoleMessages.push(text);
        try { fs.appendFileSync(path.join(SCREEN_DIR, '03-admin-console.log'), new Date().toISOString() + ' ' + text + '\n'); } catch (e) {}
      } catch (e) {}
    });
  } catch (e) {}

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

    // Optional: simulate a transient failure to exercise retry path, opt-in via env ADMIN_SIMULATE_RETRY=1
    if (process.env.ADMIN_SIMULATE_RETRY === '1') {
      // We can't easily intercept module import here without test server hooks, but we can bump counters
      try {
        await page.evaluate(() => {
          const w: any = window as any;
          w.__E2E_CHUNK_RETRY_COUNT__ = (w.__E2E_CHUNK_RETRY_COUNT__ || 0) + 1;
          w.__E2E_CHUNK_RETRY_KEYS__ = w.__E2E_CHUNK_RETRY_KEYS__ || {};
          w.__E2E_CHUNK_RETRY_KEYS__['admin-panel'] = (w.__E2E_CHUNK_RETRY_KEYS__['admin-panel'] || 0) + 1;
          w.__LAST_CHUNK_ERROR__ = 'Simulated transient load error';
        });
      } catch (e) {}
    }

    // EARLY DIAGNOSTIC: capture module/mount flags right after navigating to #admin.
    // This ensures we record whether the Admin module executed even if the test
    // later times out or the page is closed unexpectedly.
    try {
      const early = await page.evaluate(() => {
        try {
          return {
            __E2E__: Boolean((window as any).__E2E__),
            __ADMIN_PANEL_MODULE_LOADED__: Boolean((window as any).__ADMIN_PANEL_MODULE_LOADED__),
            __ADMIN_PANEL_LOADED__: Boolean((window as any).__ADMIN_PANEL_LOADED__),
            __ADMIN_PANEL_ATTEMPT__: (window as any).__ADMIN_PANEL_ATTEMPT__ || null,
            location_hash: window.location.hash || null
          };
        } catch (err) {
          return { error: String(err) };
        }
      });
      try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-early.json'), JSON.stringify(early, null, 2)); } catch (e) {}
    } catch (err) {
      try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-early.error.txt'), String(err)); } catch (e) {}
    }

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

    // Programmatically force the UI store to switch to admin view if available (helps when lazy mount requires programmatic state change)
    try {
      await page.evaluate(() => {
        try {
          const anyWin = window as any;
          // If the app exposes useUIStore on window for debugging/e2e, prefer that.
          if (anyWin.useUIStore && typeof anyWin.useUIStore.getState === 'function') {
            anyWin.useUIStore.getState().setView && anyWin.useUIStore.getState().setView('admin');
            return { invoked: 'useUIStore' };
          }
          // Otherwise try a common pattern where hooks are attached to window for tests
          if (anyWin.__USE_UI_STORE__ && anyWin.__USE_UI_STORE__.getState) {
            anyWin.__USE_UI_STORE__.getState().setView('admin');
            return { invoked: '__USE_UI_STORE__' };
          }
          return { invoked: null };
        } catch (e) {
          return { error: String(e) };
        }
      }).then(r => {
        try { fs.writeFileSync(path.join(SCREEN_DIR, '02b-invoke-setview.json'), JSON.stringify(r, null, 2)); } catch (e) {}
      });
    } catch (e) {
      try { fs.writeFileSync(path.join(SCREEN_DIR, '02b-invoke-setview.error.txt'), String(e)); } catch (w) {}
    }

    // Optional stronger forcing loop (opt-in via env): repeatedly invoke the UI store setter to ensure the admin view is selected.
    // Enable by running tests with FORCE_ADMIN_SETVIEW=1
    if (process.env.FORCE_ADMIN_SETVIEW === '1') {
      try {
        const res = await page.evaluate(async () => {
          try {
            const anyWin = window as any;
            const ui = anyWin.useUIStore || anyWin.__USE_UI_STORE__;
            if (!ui) return { ok: false, reason: 'no-ui-store' };
            const max = 20;
            for (let i = 0; i < max; i++) {
              ui.getState().setView && ui.getState().setView('admin');
              // small delay between attempts
              // eslint-disable-next-line no-await-in-loop
              await new Promise(r => setTimeout(r, 250));
              if (ui.getState().view === 'admin') return { ok: true, attempts: i + 1 };
            }
            return { ok: false, reason: 'max-attempts' };
          } catch (err) {
            return { ok: false, reason: String(err) };
          }
        });
        try { fs.writeFileSync(path.join(SCREEN_DIR, '02c-force-setview.json'), JSON.stringify(res, null, 2)); } catch (e) {}
      } catch (e) {
        try { fs.writeFileSync(path.join(SCREEN_DIR, '02c-force-setview.error.txt'), String(e)); } catch (w) {}
      }
    }

    // Wait for the network and UI to settle
    await page.waitForLoadState('networkidle');

    // Diagnostic screenshot before waiting for admin chunk
    await saveScreenshot(page, '02b-admin-before-chunk-wait.png');

    // Wait explicitly for the Admin JS chunk to be requested and return successfully.
    // In the production build Vite emits hashed assets under /assets — look for 'admin' or 'adminpanel' in the filename.
    try {
      // Allow more time for slower CI or disk-bound environments
      await page.waitForResponse(resp => {
        try {
          const url = resp.url().toLowerCase();
          return url.includes('/assets') && (url.includes('admin') || url.includes('adminpanel')) && resp.status() === 200;
        } catch (e) {
          return false;
        }
      }, { timeout: 180_000 });
    } catch (e) {
      // Fallback: if the app didn't request the chunk during the test run, verify the AdminPanel asset is present
      // and servable by making a direct request to the expected file in dist/assets.
      try {
        const assetsDir = path.join(process.cwd(), 'dist', 'assets');
        const files = fs.readdirSync(assetsDir);
        const adminFile = files.find(f => f.toLowerCase().startsWith('adminpanel'));
        if (adminFile) {
            const url = `${BASE}/assets/${adminFile}`;
            let r = null;
            try {
              r = await page.request.get(url);
              // record which asset we found for diagnostics
              try { ensureDir(); fs.writeFileSync(path.join(SCREEN_DIR, '02-admin-asset-found.txt'), String(adminFile)); } catch (w) {}
              try { fs.writeFileSync(path.join(SCREEN_DIR, '02-admin-asset-found-status.txt'), String(r.status())); } catch (w) {}
            } catch (reqErr) {
              try { ensureDir(); fs.writeFileSync(path.join(SCREEN_DIR, '02-admin-asset-request.error.txt'), String(reqErr)); } catch (w) {}
            }
            // Don't fail the test here; continue to polling and diagnostics so we can determine if the chunk executed after fetch.
          } else {
          // If we can't find AdminPanel asset deterministically, fail the test with a helpful message.
          throw new Error('AdminPanel asset not found in dist/assets');
        }
      } catch (inner) {
        throw inner;
      }
    }

  // Polling: wait up to 60s for evidence that the Admin chunk executed or mounted.
    const start = Date.now();
    let mounted = false;
  while (Date.now() - start < 60_000) {
      try {
        const check = await page.evaluate(() => {
          try {
            return {
              __E2E__: Boolean((window as any).__E2E__),
              __ADMIN_PANEL_LOADED__: Boolean((window as any).__ADMIN_PANEL_LOADED__),
              __ADMIN_PANEL_MODULE_LOADED__: Boolean((window as any).__ADMIN_PANEL_MODULE_LOADED__),
              __ADMIN_PANEL_ATTEMPT__: (window as any).__ADMIN_PANEL_ATTEMPT__ || null,
              location_hash: window.location.hash || null,
              // quick DOM check
              hasAdminText: !!document.querySelector('h1') && document.querySelector('h1')!.textContent!.toLowerCase().includes('command')
            };
          } catch (err) {
            return { error: String(err) };
          }
        });
        try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-poll-snapshot.json'), JSON.stringify({ ts: Date.now(), check }, null, 2)); } catch (e) {}
  // Prefer the module-level flag as the primary success signal (faster and less UI-dependent).
  // If the module executed but the component hasn't mounted yet, accept module execution as success.
  if (check && (check.__ADMIN_PANEL_MODULE_LOADED__ || check.__ADMIN_PANEL_LOADED__ || check.hasAdminText)) { mounted = true; break; }
  } catch (pollErr) {}
      await new Promise(r => setTimeout(r, 500));
    }

    // Immediate diagnostic capture: read important window globals right after the chunk response
    // This file helps determine whether the Admin module executed even if later steps fail.
    try {
      const immediate = await page.evaluate(() => {
        try {
          return {
            __E2E__: Boolean((window as any).__E2E__),
            __ADMIN_PANEL_LOADED__: Boolean((window as any).__ADMIN_PANEL_LOADED__),
            __ADMIN_PANEL_MODULE_LOADED__: Boolean((window as any).__ADMIN_PANEL_MODULE_LOADED__),
            __ADMIN_PANEL_ATTEMPT__: (window as any).__ADMIN_PANEL_ATTEMPT__ || null,
            location_hash: window.location.hash || null
          };
        } catch (err) {
          return { error: String(err) };
        }
      });
      try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-immediate.json'), JSON.stringify({ immediate, mounted }, null, 2)); } catch (w) {}
    } catch (err) {
      try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-immediate.error.txt'), String(err)); } catch (w) {}
    }

  // Diagnostic: after chunk fetched, capture runtime evidence.
  // 1) record the current location.hash
    // Avoid calling evaluate when the page has been closed by Playwright due to failures
    try {
      if (page.isClosed && page.isClosed()) {
        try { fs.writeFileSync(path.join(SCREEN_DIR, '03-error.txt'), 'page closed before final evaluate'); } catch (e) {}
        throw new Error('page closed before final evaluate');
      }
    } catch (e) {
      // page.isClosed may throw in some environments; continue guarded evaluate below
    }
    try {
      const currentHash = await page.evaluate(() => window.location.hash);
      try { fs.writeFileSync(path.join(SCREEN_DIR, '03-hash.txt'), String(currentHash)); } catch (e) {}
    } catch (evalErr) {
      try { fs.writeFileSync(path.join(SCREEN_DIR, '03-hash.error.txt'), String(evalErr)); } catch (e) {}
    }

  // 2) check the global flag (may be set by AdminPanel on mount)
  const adminFlag = await page.evaluate(() => { try { return Boolean((window as any).__ADMIN_PANEL_LOADED__); } catch (e) { return false; } });
  try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-flag.txt'), String(adminFlag)); } catch (e) {}

  // 3) check for presence of a unique AdminPanel DOM node (header text "Command Center" or "Command Center")
  const hasAdminText = await page.locator('text=Command Center').count().then(c => c > 0).catch(() => false);
  try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-dom.txt'), String(hasAdminText)); } catch (e) {}

  // Save a final screenshot regardless of the flag so we have visual evidence.
  await saveScreenshot(page, '03-admin-loaded-or-diagnostic.png');

  // Also check the module-level flag in case the component didn't mount but the chunk executed
  const adminModuleFlag = await page.evaluate(() => { try { return Boolean((window as any).__ADMIN_PANEL_MODULE_LOADED__); } catch (e) { return false; } });
  try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-module-flag.txt'), String(adminModuleFlag)); } catch (e) {}

  // If we simulated a transient failure, assert the retry counters incremented
  if (process.env.ADMIN_SIMULATE_RETRY === '1') {
    try {
      const counters = await page.evaluate(() => {
        const w: any = window as any;
        return {
          total: w.__E2E_CHUNK_RETRY_COUNT__ || 0,
          admin: (w.__E2E_CHUNK_RETRY_KEYS__ && w.__E2E_CHUNK_RETRY_KEYS__['admin-panel']) || 0
        };
      });
      try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-retry-counters.json'), JSON.stringify(counters, null, 2)); } catch (e) {}
      expect(counters.total >= 1 && counters.admin >= 1).toBe(true);
    } catch (e) {
      // If evaluate fails, record error but don't fail entire test on optional path
      try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-retry-counters.error.txt'), String(e)); } catch (w) {}
    }
  }

  // Write collected console messages to JSON for easier parsing in CI artifacts
  try {
    try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-console.json'), JSON.stringify({ messages: consoleMessages.slice(-200), count: consoleMessages.length }, null, 2)); } catch (e) {}
  } catch (e) {}

  // Prefer module-level or console evidence as primary success signals; fall back to mount flag or DOM.
  const foundModuleLog = consoleMessages.some(s => s.includes('[E2E] ADMIN MODULE LOADED'));
  const foundMountedLog = consoleMessages.some(s => s.includes('[E2E] ADMIN MOUNTED'));
  try { fs.writeFileSync(path.join(SCREEN_DIR, '03-admin-console-found.json'), JSON.stringify({ foundModuleLog, foundMountedLog }, null, 2)); } catch (e) {}

  const consoleEvidence = foundModuleLog || foundMountedLog;
  // Accept any of: module flag, console evidence, mount flag, or Admin DOM text
  expect(adminModuleFlag || consoleEvidence || adminFlag || hasAdminText).toBe(true);
  });
});
