import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\being\\.gemini\\antigravity-ide\\brain\\a081c541-0e39-46e5-9cb8-233fc5df85e0';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'outside_hero_test');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function test() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4500));

  // Scroll to WhoIsRavenSection (e.g. 4500px)
  console.log('Scrolling to 4500px (WhoIsRavenSection)...');
  await page.evaluate(() => window.scrollTo(0, 4500));
  await new Promise(r => setTimeout(r, 1000));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_scroll_4500_closed.png') });

  // Open menu at 4500px
  console.log('Opening menu at 4500px...');
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_scroll_4500_open.png') });

  const info = await page.evaluate(() => {
    const who = document.getElementById('who-is-raven-section');
    const hero = document.getElementById('hero-scroll-container');
    const whoSticky = who?.querySelector('section');
    const heroSticky = hero?.querySelector('section');
    return {
      scrollY: window.scrollY,
      whoRect: who?.getBoundingClientRect(),
      whoStickyRect: whoSticky?.getBoundingClientRect(),
      whoStickyTransform: whoSticky?.style.transform,
      heroStickyTransform: heroSticky?.style.transform,
    };
  });
  console.log('State at 4500px:', JSON.stringify(info, null, 2));

  await browser.close();
}

test();
