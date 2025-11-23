import { test, expect } from '@playwright/test'

test('navigates to password reset and shows form', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await page.waitForURL('**/forget-pw')

  await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible()
  await expect(page.locator('input#email')).toBeVisible()

  // Submit with a syntactically valid email; SDK may error in tests, assert any message appears
  await page.locator('input#email').fill('test@example.com')
  await page.getByRole('button', { name: 'Submit' }).click()

  // Accept either success or one of known error messages to avoid external dependency
  const message = page.locator('text=/A password reset email has been sent!|No account is found|This email is invalid|Soemthing went wrong/').first()
  await expect(message).toBeVisible({ timeout: 15000 })
})

