import { test, expect } from '@playwright/test'

test('user can open calendar and add an event (mocked login)', async ({ page }) => {
  // Ensure flag exists as early as possible
  await page.addInitScript(() => { try { localStorage.setItem('e2e_login', '1') } catch {} })
  // Visit home first (avoid any early client redirect), then go to calendar
  await page.goto('/')
  await page.evaluate(() => { try { localStorage.setItem('e2e_login', '1') } catch {} })
  // Navigate with helper to auto-open Add modal and avoid timing on buttons
  await page.goto('/calendar/view?autoOpenAdd=1')
  await page.waitForURL('**/calendar/view?autoOpenAdd=1')
  await expect(page.getByRole('heading', { name: 'Add event' })).toBeVisible({ timeout: 15000 })

  const unique = 'E2E Event ' + Date.now()
  await page.getByPlaceholder('Event name').fill(unique)
  // Keep default dates/times; just save from inside the modal (avoid header button)
  const modal = page.locator('div:has(> h3:text("Add event"))').first()
  await modal.locator('button[type="submit"]').click()

  // Verify success toast appears (robust for E2E without Firestore timing)
  await expect(page.getByText('Event added')).toBeVisible({ timeout: 15000 })
  // We rely on the toast for deterministic success in E2E.
})
