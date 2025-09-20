Playwright E2E test guide

This project includes a Playwright test that verifies the Admin UI is lazy-loaded:

- Test file: tests/e2e/admin-lazy.spec.ts

Local run (developer machine):
1. Install Playwright and browsers:
   npm install -D @playwright/test
   npx playwright install

2. Start the dev server (bind to 127.0.0.1 to match the test default):
   HOST=127.0.0.1 PORT=5173 npm run dev

3. Run tests:
   npx playwright test tests/e2e/admin-lazy.spec.ts

CI (recommended):
- Use the `test:e2e:ci` script which installs browsers and runs tests in headless mode.
- Example (GitHub Actions):

  - name: Install packages
    run: npm ci

  - name: Install Playwright browsers
    run: npx playwright install --with-deps

  - name: Start dev server (background)
    run: HOST=127.0.0.1 PORT=5173 npm run dev &

  - name: Run e2e tests
    run: npm run test:e2e:ci

Notes:
- The test expects a navigation control labeled 'Admin' or a nav item with `data-testid="nav-admin"`.
- The Admin panel sets a dev-only flag `window.__ADMIN_PANEL_LOADED__ = true` on mount which the test checks.
- If your app uses authentication gating for Admin, you may need to mock or seed a test account in CI, or adjust the test to sign in first.
