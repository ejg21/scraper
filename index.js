const express = require("express");
const axios = require("axios");
const pretty = require("pretty");
const { URL } = require("url");

const app = express();
const PORT = 3000;

app.get("/", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send("Missing ?url parameter");
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const base = `${parsedUrl.protocol}//${parsedUrl.host}`;

    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Referer": base,
        "Origin": base,
      },
    });

    const formattedHtml = pretty(response.data);
    res.set("Content-Type", "text/html");
    res.send(formattedHtml);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Failed to fetch or parse URL.");
  }
});

app.listen(PORT, () => {
  console.log(`Scraper running at http://localhost:${PORT}/?url=https://example.com`);
});
