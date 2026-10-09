import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\being\\.gemini\\antigravity-ide\\brain\\a081c541-0e39-46e5-9cb8-233fc5df85e0';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'svg_mask_tests');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4500));

  // Open menu
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));

  // Inject SVG mask overlay into DOM
  await page.evaluate(() => {
    const existing = document.getElementById('portal-backdrop-overlay');
    if (existing) existing.remove();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'portal-backdrop-overlay');
    svg.setAttribute('class', 'fixed inset-0 w-full h-full pointer-events-none z-30');
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100vw';
    svg.style.height = '100vh';
    svg.style.zIndex = '30';
    svg.style.pointerEvents = 'none';

    svg.innerHTML = `
      <defs>
        <mask id="portal-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x="24" y="calc(50vh + 24px)" width="calc(100% - 48px)" height="calc(50vh - 48px)" rx="24" ry="24" fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="#18181b" mask="url(#portal-mask)" />
    `;
    document.body.appendChild(svg);
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'svg_mask_scroll0.png') });

  // Test at scroll 1200
  await page.evaluate(() => {
    const el = document.getElementById('portal-backdrop-overlay');
    if (el) el.remove();
  });
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => window.scrollTo(0, 1200));
  await new Promise(r => setTimeout(r, 1000));

  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('id', 'portal-backdrop-overlay');
    svg.style.position = 'fixed';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.width = '100vw';
    svg.style.height = '100vh';
    svg.style.zIndex = '30';
    svg.style.pointerEvents = 'none';

    svg.innerHTML = `
      <defs>
        <mask id="portal-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x="24" y="calc(50vh + 24px)" width="calc(100% - 48px)" height="calc(50vh - 48px)" rx="24" ry="24" fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="#18181b" mask="url(#portal-mask)" />
    `;
    document.body.appendChild(svg);
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'svg_mask_scroll1200.png') });

  console.log('SVG mask test complete!');
  await browser.close();
}

run();
