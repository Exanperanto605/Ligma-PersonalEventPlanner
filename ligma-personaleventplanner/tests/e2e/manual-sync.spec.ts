import { test, expect } from '@playwright/test'

test('manual sync button shows syncing and last synced time', async ({ page }) => {
  await page.goto('/')
  const syncBtn = page.getByRole('button', { name: 'Sync now' })
  await expect(syncBtn).toBeVisible()
  await syncBtn.click()
  await expect(page.getByRole('button', { name: 'Syncing…' })).toBeVisible()
  await expect(page.getByText('Last synced:')).toBeVisible({ timeout: 5000 })
})

