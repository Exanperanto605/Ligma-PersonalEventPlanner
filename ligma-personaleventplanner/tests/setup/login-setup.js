// tests/setup/login-setup.js
const { chromium } = require('playwright'); // ใช้ playwright (not playwright/test) เพื่อ access launchPersistentContext

(async () => {
  // เปลี่ยน path นี้เป็นที่เก็บ profile ของคุณ (จะสร้างถ้ายังไม่มี)
  const userDataDir = './tmp/playwright-user-data';

  console.log('⏳ Launching real Chrome (headed) with persistent profile...');
  const context = await chromium.launchPersistentContext(userDataDir, {
    channel: 'chrome',         // ใช้ Chrome ที่ติดตั้งจริง (ลอง "msedge" หรือ "chrome" หากมี)
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      // '--no-sandbox' // อย่าใช้ถ้าไม่จำเป็น
    ],
  });

  const page = await context.newPage();
  console.log('Opening app...');
  await page.goto('http://localhost:3000'); // เปลี่ยนพอร์ตถ้าจริงเป็น 5173 หรือ 3000

  console.log('Please perform Google sign-in in the opened browser window.');

  // รอจน redirect ไปหน้า dashboard — ปรับ pattern ให้ตรงโปรเจ็คของคุณ
  await page.waitForURL('**/dashboard', { timeout: 120000 });

  console.log('Saving storage state to storageState.json ...');
  await context.storageState({ path: 'storageState.json' });

  await context.close();
  console.log('✅ Done. storageState.json created. You can now run Playwright tests using this state.');
})();
