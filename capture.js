const { chromium } = require('playwright');
const { mkdir } = require('fs/promises');
const path = require('path');

async function capture(url) {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle' });

    // Extract domain from URL
    const urlObj = new URL(url);
    const domain = urlObj.hostname.replace(/^www\./, '') || 'local';

    // Create output directory: screenshots/domain/YYYY-MM-DD
    const date = new Date().toISOString().split('T')[0];
    const outputDir = path.join('screenshots', domain, date);
    await mkdir(outputDir, { recursive: true });

    const viewport = page.viewportSize();
    const viewportHeight = viewport.height;

    let scrollPosition = 0;
    let index = 0;

    // Capture screenshots while scrolling
    while (true) {
      const filename = path.join(outputDir, `${String(index).padStart(3, '0')}.png`);
      await page.screenshot({ path: filename });

      index++;
      scrollPosition += viewportHeight;

      // Re-evaluate scroll height for dynamically loaded content
      const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);

      if (scrollPosition < scrollHeight) {
        await page.evaluate((scrollY) => window.scrollTo(0, scrollY), scrollPosition);
        // Wait for lazy-loaded content
        await page.waitForTimeout(500);
      } else {
        break;
      }
    }

    console.log(`Saved ${index} screenshots to ${outputDir}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Parse command line arguments
const url = process.argv[2];

if (!url) {
  console.error('Usage: node capture.js <url>');
  process.exit(1);
}

// Validate URL before launching browser
try {
  new URL(url);
} catch (error) {
  console.error(`Error: Invalid URL provided: ${url}`);
  process.exit(1);
}

capture(url).catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
