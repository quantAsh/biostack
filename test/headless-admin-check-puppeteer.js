const puppeteer = require('puppeteer-core');
const fs = require('fs');
(async ()=>{
  // Attempt to find a Chrome/Chromium path in common locations
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ];
  let executablePath = null;
  for (const p of candidates) {
    if (fs.existsSync(p)) { executablePath = p; break; }
  }
  if (!executablePath) {
    console.error('No local Chrome/Chromium binary found for puppeteer-core.');
    process.exit(4);
  }
  const browser = await puppeteer.launch({ headless: true, executablePath });
  const page = await browser.newPage();
  const requests = [];
  page.on('request', r => requests.push({ url: r.url(), type: r.resourceType() }));
  const url = 'http://127.0.0.1:5173/';
  console.log('Opening', url);
  try { await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 }); } catch (e) { console.error('goto failed', e.message||e); await browser.close(); process.exit(3); }
  // Click or navigate to admin — try triggering internal navigation if router is present
  try {
    // Try find an admin nav button/link
    await page.evaluate(() => {
      // try to click elements that look like admin links
      const selectors = ['a[href="/admin"]', '[data-nav="admin"]', 'button[data-nav="admin"]'];
      for (const s of selectors) {
        const el = document.querySelector(s);
        if (el) { el.click(); return true; }
      }
      // fallback: set view in window store if available
      if (window.__USE_UI_STORE__ && typeof window.useUIStore !== 'undefined') {
        try { window.useUIStore.getState().setView('admin'); return true; } catch(e){}
      }
      return false;
    });
  } catch (e) {
    // ignore
  }
  await page.waitForTimeout(1500);
  const adminReq = requests.find(r => r.url.includes('AdminPanel') || r.url.match(/AdminPanel.*\.js/));
  console.log('Requests captured:', requests.length);
  if (adminReq) { console.log('ADMIN_REQUEST_FOUND', adminReq); await browser.close(); process.exit(0); }
  console.log('ADMIN_REQUEST_NOT_FOUND');
  console.log('Recent requests:', requests.slice(-20));
  await browser.close();
  process.exit(2);
})();
