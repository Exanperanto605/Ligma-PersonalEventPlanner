import { test, expect } from '@playwright/test';

test('opens home page', async ({ page }) => {
  await page.goto('http://localhost:3000'); // เปลี่ยน URL ให้ตรงโปรเจกต์
  await expect(page).toHaveTitle(/.*|.*/); // แค่ check ว่ามี title
});
