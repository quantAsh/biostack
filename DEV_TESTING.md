Quick local testing guide

Goal: get you running locally and able to quickly test Admin and UX flows.

1) Start dev server (bind to IPv4 so Playwright / CI and local tests are stable):

```bash
HOST=127.0.0.1 PORT=5173 npm run dev
```

2) Seed a dev session quickly (open browser console and paste the snippet from `scripts/seed-dev-session.js` or run the snippet below):

```js
// Minimal dev session payload - sets a ui-visible username and marks as signed-in
window.localStorage.setItem('biostack_session_v1', JSON.stringify({ uid: 'dev-user', displayName: 'Dev Tester', isAnonymous: false, ts: Date.now() }));
window.location.reload();
```

3) Open the app at http://127.0.0.1:5173 and navigate to Admin (click the Admin nav or run `document.querySelector('[data-testid="nav-admin"]').click()` in console).

4) Verify Admin mounted by checking in console:

```js
console.log(window.__ADMIN_PANEL_LOADED__);
```

Running the Playwright e2e locally (recommended helper)
-----------------------------------------------------

Install helper and Playwright (one-time):

```bash
npm i -D start-server-and-test
npm i -D @playwright/test
npx playwright install
```

Run e2e with an automatic dev server startup and wait-for-server logic:

```bash
npm run e2e:local
```

Common failure: net::ERR_CONNECTION_REFUSED
-----------------------------------------------------
- Cause: Playwright attempted to navigate to http://127.0.0.1:5173 but the dev server was not yet listening on that port. This yields a connection refused.
- Fixes:
	1) Ensure your dev server can bind to 127.0.0.1 and the PORT=5173 is free.
	2) Run `HOST=127.0.0.1 PORT=5173 npm run dev` manually and verify you can open http://127.0.0.1:5173 in a browser before running Playwright.
	3) Use `npm run e2e:local` which will start the dev server and only run Playwright once the URL responds.

If Playwright still sees connection refused in CI, check that the job environment allows binding to 127.0.0.1 and that no firewall/port restrictions exist.

5) Run unit tests quickly:

```bash
npm test
```

6) Run e2e locally (requires Playwright):

```bash
npx playwright test tests/e2e/admin-lazy.spec.ts
```

Notes:
- If Admin requires auth, use the seed steps or extend the seed snippet to set other session flags.
- If you want automated seeding at dev server start, I can add a small dev-only endpoint that injects a session cookie or a query param that triggers auto-login. Do you want that?
