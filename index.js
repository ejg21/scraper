const express = require('express');
const axios = require('axios');
const pretty = require('pretty');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing ?url= query parameter');
  }

  try {
    const { origin } = new URL(targetUrl);
    const headers = {
      'Referer': origin,
      'Origin': origin,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };

    const response = await axios.get(targetUrl, { headers });
    const rawHtml = response.data;
    const formattedHtml = pretty(rawHtml);

    res.send(`<pre>${escapeHtml(formattedHtml)}</pre>`);
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
