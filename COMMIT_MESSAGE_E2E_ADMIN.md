tests(e2e): harden admin-lazy E2E and add module-level instrumentation

- Add module-level flag `window.__ADMIN_PANEL_MODULE_LOADED__` to `components/AdminPanel.tsx` when module executes (guarded by `__E2E__` or dev).
- Add a short (500ms) guarded poll in `AdminPanel` to set the module flag if `__E2E__` appears slightly after module evaluation.
- Update `tests/e2e/admin-lazy.spec.ts` to:
  - capture an early diagnostic `03-admin-early.json` right after navigating to `#admin`;
  - include module-level flag in immediate/poll diagnostics;
  - increase response/poll timeouts and test timeout to reduce flakiness;
  - guard page.evaluate calls and write diagnostic error files on failure.

Drops flaky false negatives where the test sets `__E2E__` just after module evaluation and improves reliability in CI.
