import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // run only project unit tests and explicitly exclude node_modules and e2e tests
    include: ['tests/**/*.test.*', 'tests/**/*.spec.*', 'src/**/*.test.*', 'src/**/*.spec.*'],
    exclude: ['node_modules/**', 'e2e/**', 'playwright.config.*'],
    environment: 'jsdom',
    globals: true,
    deps: {
      // avoid inlining heavy or conflicting deps like Playwright
      external: ['@playwright/test', 'playwright'],
    },
  },
})
