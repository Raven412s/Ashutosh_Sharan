import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\being\\.gemini\\antigravity-ide\\brain\\a081c541-0e39-46e5-9cb8-233fc5df85e0';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'portal_bg_verification');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function verify() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--window-size=1920,1080'],
    defaultViewport: { width: 1920, height: 1080 }
  });

  const page = await browser.newPage();
  
  // 1. Homepage at scroll 0
  console.log('Navigating to homepage...');
  await page.goto('http://localhost:3000/en', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 4500));

  console.log('Capturing scroll 0 closed...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_home_scroll0_closed.png') });

  // Open menu
  console.log('Opening menu at scroll 0...');
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_home_scroll0_open.png') });

  // Close menu
  console.log('Closing menu...');
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));

  // 2. Homepage at scroll 1200
  console.log('Scrolling to 1200px...');
  await page.evaluate(() => window.scrollTo(0, 1200));
  await new Promise(r => setTimeout(r, 1000));

  console.log('Opening menu at scroll 1200px...');
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_home_scroll1200_open.png') });

  // Close menu
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_home_scroll1200_closed.png') });

  // 3. /works page
  console.log('Navigating to /works page...');
  await page.goto('http://localhost:3000/en/works', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 3500)); // allow page transition to settle

  console.log('Opening menu on /works...');
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_works_open.png') });

  // Close menu
  await page.click('button[aria-label*="Navigation Menu"], button[data-navbar-item]');
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_works_closed.png') });

  console.log('All verification screenshots saved successfully!');
  await browser.close();
}

verify();
