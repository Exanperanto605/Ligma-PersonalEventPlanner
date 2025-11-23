import { test, expect } from '@playwright/test'

test('to-do list renders and shows empty state', async ({ page }) => {
  // Mock login for calendar
  await page.addInitScript(() => { try { localStorage.setItem('e2e_login', '1') } catch {} })
  await page.goto('/calendar/view')
  await page.waitForURL('**/calendar/view')

  await expect(page.getByRole('heading', { name: 'To-do list' })).toBeVisible()
  await expect(page.getByText('No tasks')).toBeVisible()
})

