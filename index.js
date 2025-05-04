const express = require("express");
const axios = require("axios");
const pretty = require("pretty");
const { URL } = require("url");

const app = express();
const PORT = 3000;

app.get("/", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send("Missing ?url parameter");

  try {
    const parsedUrl = new URL(targetUrl);
    const base = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    const response = await axios.get(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Referer": base,
        "Origin": base,
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1"
      },
      timeout: 10000,
      validateStatus: null // Prevent axios from throwing on 403s
    });

    if (response.status >= 400) {
      console.error("Blocked or failed request:", response.status);
      return res
        .status(response.status)
        .send(`Target returned HTTP ${response.status}`);
    }

    const formattedHtml = pretty(response.data);
    res.set("Content-Type", "text/html");
    res.send(formattedHtml);
  } catch (error) {
    console.error("Request error:", error.message);
    res.status(500).send("Failed to fetch or parse URL.");
  }
});

app.listen(PORT, () => {
  console.log(`Scraper running at http://localhost:${PORT}/?url=https://example.com`);
});
