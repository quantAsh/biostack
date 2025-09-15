import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // exclude end-to-end Playwright tests from Vitest
    exclude: ['e2e/**', 'playwright.config.*'],
    environment: 'jsdom',
    globals: true,
  },
})
