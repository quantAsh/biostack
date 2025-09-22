E2E Instrumentation & Debugging Guide

Purpose

This document describes the small, opt-in instrumentation used by Playwright E2E tests to deterministically verify that the lazy-loaded Admin UI is fetched and executed in production builds, and how to debug failures in CI.

Key window globals (opt-in)

- `window.__E2E__`: boolean set by the test's `addInitScript` before any page scripts run. When true, production builds enable extra runtime flags for testing.
- `window.__ADMIN_PANEL_ATTEMPT__`: timestamp set by `AdminPanel` on mount if `__E2E__` is enabled.
- `window.__ADMIN_PANEL_LOADED__`: boolean set by `AdminPanel` on successful mount when `__E2E__` is enabled.

How tests seed the app

- Tests call `context.addInitScript` to:
  - set `window.__E2E__ = true`
  - seed `localStorage['biostack_session_v1']` with an admin session so admin-only UI is available
  - force `window.location.hash = '#admin'` so hash-based routing selects the admin view on initial load

Artifacts written by the test

By default tests write to `test-results/e2e-screenshots/`:
- `00-nav-status.txt` — navigation response HTTP status
- `01-home.png` — screenshot after initial load
- `02-admin-navigated.png` — screenshot after navigating to `#admin`
- `02b-admin-before-chunk-wait.png` — screenshot before waiting for asset fetch
- `02b-invoke-setview.json` — result of attempting `useUIStore.getState().setView('admin')` in-page
- `network-requests.txt` — logged asset/network responses matching '/assets' or 'admin'
- `03-admin-immediate.json` — immediate capture of `{ __E2E__, __ADMIN_PANEL_LOADED__, __ADMIN_PANEL_ATTEMPT__, location_hash }` and a `mounted` boolean (from polling)
- `03-admin-poll-snapshot.json` — polling snapshots captured while waiting for admin mount
- `03-admin-flag.txt` / `03-admin-dom.txt` — simple diagnostic checks

Minimal diagnostic checklist if admin chunk GET 200 but mount looks missing

1. Confirm asset fetch:
   - Inspect `network-requests.txt` and Playwright trace to ensure the GET for `/assets/AdminPanel-*.js` returned 200.
2. Confirm addInitScript ran:
   - Look in Playwright trace console logs for the init script code or check `03-admin-immediate.json` `__E2E__` value.
3. If asset was fetched but `__ADMIN_PANEL_LOADED__` is false:
   - There may be no side-effect in the module top-level; mounting logic may be gated behind a hook that didn't run because the component hasn't been inserted into the UI tree.
   - The test now attempts to programmatically call `useUIStore.getState().setView('admin')` and polls for `__ADMIN_PANEL_LOADED__` and an Admin DOM node. Check `02b-invoke-setview.json` to see if the setter was invoked.
4. If the setter invoked but still no mount:
   - Add a small test patch (below) that calls the app's internal setter repeatedly until `useUIStore.getState().view === 'admin'` and then triggers an artificial re-render (e.g., toggling a test hook) — this is the minimal patch I can recommend.

Minimal test patch (if needed)

Insert a short snippet after navigation in `tests/e2e/admin-lazy.spec.ts`:

```ts
// Try repeatedly to force view into admin and then wait
await page.evaluate(() => {
  try {
    const anyWin = window as any;
    const ui = anyWin.useUIStore || anyWin.__USE_UI_STORE__;
    if (!ui) return { ok: false, reason: 'no-ui-store' };
    const max = 10;
    for (let i = 0; i < max; i++) {
      ui.getState().setView && ui.getState().setView('admin');
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: String(e) };
  }
});
```

This tries to force the in-memory store to the admin view. Combined with the existing polling and immediate diagnostics it should disambiguate whether the chunk executed but didn't mount.

When to escalate

- If asset fetch fails (404) — ensure `dist` is correctly built and the static server is serving `dist/assets`.
- If asset fetch succeeds but module not executed — consider adding a small inline script in the app build (dev-only) that logs early module execution or expose a test-only global registration on `window.__ADMIN_MODULES__`.

Contact

If you share `test-results/e2e-screenshots/03-admin-immediate.json` and the Playwright trace, I will analyze and propose the minimal focused patch (likely the repeated setter calls or a small polling/fallback that mounts AdminPanel programmatically).
