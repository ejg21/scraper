const express = require('express');
const fetch = require('node-fetch');
const axios = require('axios');
const cheerio = require('cheerio');
const pretty = require('pretty');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing ?url= query parameter');
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const hostname = parsedUrl.hostname;

    let headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    };

    let html = '';
    let usedTool = '';
    
    if (hostname === 'vidsrc.su') {
      // Use axios and cheerio without Referer/Origin
      const response = await axios.get(targetUrl, { headers });
      const $ = cheerio.load(response.data);
      html = pretty($.html());
      usedTool = 'axios + cheerio';
    } else {
      // Set headers depending on host
      if (hostname === 'api.rgshows.me') {
        headers['Referer'] = 'https://vidsrc.wtf';
        headers['Origin'] = 'https://vidsrc.wtf';
      } else {
        headers['Referer'] = parsedUrl.origin;
        headers['Origin'] = parsedUrl.origin;
      }

      const response = await fetch(targetUrl, { headers });
      html = pretty(await response.text());
      usedTool = 'node-fetch';
    }

    const escapedHtml = escapeHtml(html);
    const footer = `
<hr>
<b>Tool Used:</b> ${usedTool}<br>
<b>Headers Used:</b><br>
User-Agent: ${headers['User-Agent']}<br>
Referer: ${headers['Referer'] || 'N/A'}<br>
Origin: ${headers['Origin'] || 'N/A'}
    `.trim();

    res.send(`<pre>${escapedHtml}</pre>${footer}`);
  } catch (error) {
    res.status(500).send('Error: ' + error.message);
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
