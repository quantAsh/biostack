<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1RlALQyyrfB3bpEQYuzyFwCGNQ-DAr3fd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Production deployment

Follow these steps to prepare and deploy to staging/production. Do NOT commit production secrets to the repository — use your hosting provider or GitHub Actions secrets instead.

1. Copy `.env.production.example` to `.env.production` (do not commit this file) and populate required keys.

2. CI: This repository includes a GitHub Actions workflow at `.github/workflows/ci.yml` which will run on PRs and pushes to `main`. The workflow installs dependencies, builds the site, and attempts to run unit tests.

3. Secrets: Add the following secrets to your host or GitHub Actions:
   - `GEMINI_API_KEY`
   - `VITE_FIREBASE_*` keys (if using Firebase in production)
   - any other service keys (Solana RPC URL, pinning service keys, etc.)

4. Staging: Create a staging environment and deploy the built `dist/` from the CI artifact. Run smoke tests (including `/?walkthrough=1`) and verify admin sign-in before promoting.

5. Production: Once staging is validated, promote the deployment to production and enable monitoring/alerts (Sentry, Cloud Monitoring).

If you need a script or GitHub Action to deploy to a specific host (Vercel, Netlify, Firebase Hosting), I can add an example workflow for that provider.

```
<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1RlALQyyrfB3bpEQYuzyFwCGNQ-DAr3fd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
