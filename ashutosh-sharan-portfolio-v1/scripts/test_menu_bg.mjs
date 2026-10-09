import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\being\\.gemini\\antigravity-ide\\brain\\a081c541-0e39-46e5-9cb8-233fc5df85e0';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'menu_bg_tests');

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

  // Now apply box-shadow and height: 50vh via DOM evaluate to preview
  await page.evaluate(() => {
    const clipWrapper = document.querySelector('div[class*="border-white"]');
    console.log('clipWrapper found:', !!clipWrapper);
    if (clipWrapper) {
      clipWrapper.style.boxShadow = '0 0 0 100vmax rgb(24 24 27)';
    }
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'preview_scroll0_open.png') });

  // Close menu and test scroll 1200
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => window.scrollTo(0, 1200));
  await new Promise(r => setTimeout(r, 1000));

  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));

  await page.evaluate(() => {
    const pageContainer = document.querySelector('div[class*="text-foreground relative flex flex-col"]');
    const clipWrapper = document.querySelector('div[class*="border-white rounded-[24px]"]');
    
    if (pageContainer) {
      pageContainer.style.height = '50vh';
    }
    if (clipWrapper) {
      clipWrapper.style.boxShadow = '0 0 0 100vmax rgb(24 24 27)';
    }
  });

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'preview_scroll1200_open.png') });

  console.log('Screenshots saved!');
  await browser.close();
}

run();
