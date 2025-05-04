const express = require("express");
const https = require("https");
const { URL } = require("url");
const pretty = require("pretty");

const app = express();
const PORT = 3000;

app.get("/", async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send("Missing ?url parameter");
  }

  try {
    const parsedUrl = new URL(targetUrl);
    const baseOrigin = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + (parsedUrl.search || ""),
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": baseOrigin,
        "Origin": baseOrigin,
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-User": "?1"
      }
    };

    https
      .get(options, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          if (response.statusCode >= 400) {
            console.error("Failed with status:", response.statusCode);
            return res
              .status(response.statusCode)
              .send(`Target returned HTTP ${response.statusCode}`);
          }

          const formattedHtml = pretty(data);
          res.set("Content-Type", "text/html");
          res.send(formattedHtml);
        });
      })
      .on("error", (err) => {
        console.error("HTTPS error:", err.message);
        res.status(500).send("Failed to fetch URL.");
      });
  } catch (err) {
    console.error("URL parse error:", err.message);
    res.status(400).send("Invalid URL.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}/?url=https://example.com`);
});
