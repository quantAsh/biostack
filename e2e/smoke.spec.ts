import { test, expect } from '@playwright/test'

test('homepage smoke', async ({ page, baseURL }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Kairos|biohackstack|Kai/i)
})
