import { test, expect } from '@playwright/test'

test('user can open calendar and add an event (mocked login)', async ({ page }) => {
  // Ensure flag exists as early as possible
  await page.addInitScript(() => { try { localStorage.setItem('e2e_login', '1') } catch {} })
  // Visit home first (avoid any early client redirect), then go to calendar
  await page.goto('/')
  await page.evaluate(() => { try { localStorage.setItem('e2e_login', '1') } catch {} })
  await page.goto('/calendar/view')
  await page.waitForURL('**/calendar/view')

  // Wait for any add-event button to be ready (header or Today mini)
  await page.waitForSelector('[data-testid="add-event-btn"], [data-testid="add-event-mini-btn"]', { state: 'attached', timeout: 15000 })
  const addBtn = page.locator('[data-testid="add-event-btn"], [data-testid="add-event-mini-btn"]').first()
  await expect(addBtn).toBeVisible({ timeout: 15000 })
  await addBtn.click()
  await expect(page.getByText('Add event')).toBeVisible()

  const unique = 'E2E Event ' + Date.now()
  await page.getByPlaceholder('Event name').fill(unique)
  // Keep default dates/times; just save
  await page.getByRole('button', { name: 'Add Event' }).click()

  // Verify it appears in the Today list
  await expect(page.getByText(unique)).toBeVisible()
})
