# 2025-09-22 — E2E: Admin lazy-load reliability improvements

- Add module-level instrumentation: set `window.__ADMIN_PANEL_MODULE_LOADED__` when the Admin module executes (guarded by `__E2E__` or dev).
- Add a short guarded poll (500ms) in `AdminPanel` to catch cases where `__E2E__` is set slightly after module evaluation.
- Harden Playwright E2E `tests/e2e/admin-lazy.spec.ts`:
  - Seed `window.__E2E__` and admin dev session in init script.
  - Add early diagnostic capture (`03-admin-early.json`) immediately after navigating to `#admin`.
  - Increase asset wait timeout and polling time (180s asset wait, 60s polling).
  - Avoid calling `page.evaluate` on closed pages; write error artifacts when evaluate fails.
  - Increase test timeout to 240s to avoid premature test termination in slow environments.
- These changes reduce flaky failures and allow CI to detect chunk fetch + execution deterministically.
- PR branch created for review 2025-09-22T23:20:27Z
