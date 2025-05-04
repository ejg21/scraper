const express = require('express');
const fetch = require('node-fetch');
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

    // Custom header logic based on hostname
    if (hostname === 'api.rgshows.me') {
      headers['Referer'] = 'https://vidsrc.wtf';
      headers['Origin'] = 'https://vidsrc.wtf';
    } else if (hostname === 'g9uxp3w0zlkrt4su.blorvaxlight15.xyz') {
      headers['Referer'] = 'https://vidsrc.su';
      headers['Origin'] = 'https://vidsrc.su';
    } else if (hostname !== 'vidsrc.su') {
      headers['Referer'] = parsedUrl.origin;
      headers['Origin'] = parsedUrl.origin;
    }
    // If vidsrc.su, do not add Referer or Origin

    const response = await fetch(targetUrl, { headers });
    const rawHtml = await response.text();
    const formattedHtml = pretty(rawHtml);
    const escapedHtml = escapeHtml(formattedHtml);

    const footer = `
<hr>
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
