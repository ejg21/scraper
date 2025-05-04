const express = require('express');
const pretty = require('pretty');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing ?url= query parameter');
  }

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    });

    const page = await context.newPage();
    await page.goto(targetUrl, { waitUntil: 'networkidle' });

    const rawHtml = await page.content();
    const formattedHtml = pretty(rawHtml);

    res.send(`<pre>${escapeHtml(formattedHtml)}</pre>`);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
  } finally {
    if (browser) await browser.close();
  }
});

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
