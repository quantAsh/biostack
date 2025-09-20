const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const requests = [];
  page.on('request', r => requests.push({ url: r.url(), resourceType: r.resourceType() }));

  const url = 'http://127.0.0.1:5173/';
  console.log('Opening', url);
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
  } catch (e) {
    console.error('goto error', e.message || e);
    await browser.close();
    process.exit(3);
  }

  // Trigger the same dynamic import the app uses
  console.log('Triggering dynamic import of AdminPanel');
  try {
    await page.evaluate(() => import('/src/components/AdminPanel.tsx'));
  } catch (e) {
    // dynamic import might not evaluate on the page as module path differs; ignore
    console.warn('evaluate import error (may be expected):', e.message || e);
  }

  // Wait a short moment for network activity
  await page.waitForTimeout(1500);

  const adminReq = requests.find(r => r.url.includes('AdminPanel') || r.url.includes('AdminPanel.tsx') || r.url.match(/AdminPanel.*\.js/));

  console.log('Total requests captured:', requests.length);
  if (adminReq) {
    console.log('ADMIN_REQUEST_FOUND', adminReq);
    await browser.close();
    process.exit(0);
  } else {
    console.log('ADMIN_REQUEST_NOT_FOUND');
    // print some recent requests for debugging
    console.log(requests.slice(-10));
    await browser.close();
    process.exit(2);
  }
})();
