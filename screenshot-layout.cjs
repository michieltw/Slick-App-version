const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 900 }
  });

  await page.goto('http://localhost:4173/');
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'layout-screenshot.png' });
  await browser.close();
})();
