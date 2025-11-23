import { test, expect } from '@playwright/test'

test('2FA verify submits to API (stubbed)', async ({ page }) => {
  // Mock login so protected route works
  await page.addInitScript(() => { try { localStorage.setItem('e2e_login', '1') } catch {} })

  // Stub the verify API to always succeed for this test
  await page.route('**/api/2fa/verify', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto('/verify-2fa')
  await expect(page.getByRole('heading', { name: 'Two-Factor Authentication' })).toBeVisible()

  await page.getByPlaceholder('XXXXXX').fill('123456')
  const [req] = await Promise.all([
    page.waitForRequest('**/api/2fa/verify'),
    page.getByRole('button', { name: 'Submit' }).click(),
  ])
  expect(req.url()).toContain('/api/2fa/verify')
})

test('2FA setup page renders (smoke)', async ({ page }) => {
  await page.addInitScript(() => { try { localStorage.setItem('e2e_login', '1') } catch {} })
  await page.goto('/setup-2fa')
  await expect(page.getByPlaceholder('XXXXXX')).toBeVisible({ timeout: 15000 })
})
