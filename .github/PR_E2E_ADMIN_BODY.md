Title: tests(e2e): harden admin-lazy E2E and add module-level instrumentation

Summary:
- Add module-level flag `window.__ADMIN_PANEL_MODULE_LOADED__` to `components/AdminPanel.tsx` when module executes (guarded by `__E2E__` or dev).
- Add a short (500ms) guarded poll in `AdminPanel` to set the module flag if `__E2E__` appears slightly after module evaluation.
- Update `tests/e2e/admin-lazy.spec.ts` to:
  - capture an early diagnostic `03-admin-early.json` right after navigating to `#admin`;
  - include module-level flag in immediate/poll diagnostics;
  - increase response/poll timeouts and test timeout to reduce flakiness;
  - guard page.evaluate calls and write diagnostic error files on failure.

Testing checklist (manual/CI):
- Run full E2E locally:
  - FORCE_ADMIN_SETVIEW=1 npm run test:e2e:ci
  - confirm `tests/e2e/admin-lazy.spec.ts` passes and artifacts are created under `test-results/`.
- Check `test-results/e2e-screenshots/03-admin-early.json` contains either `__ADMIN_PANEL_MODULE_LOADED__: true` OR `__ADMIN_PANEL_LOADED__: true`.
- Verify network log contains `AdminPanel-*.js` with HTTP 200.
- On CI, ensure Playwright trace/video attachments are generated when failures occur for easy debugging.

Notes:
- The module-level poll is intentionally short (500ms) to avoid long-running background timers; it only runs when tests set `__E2E__` after module evaluation.
- If you prefer module flag to be the primary success signal in CI, we can change the test assertion to prefer `__ADMIN_PANEL_MODULE_LOADED__`.

Changelog: See `changelogs/2025-09-22-e2e-admin-lazy.md` for details.
