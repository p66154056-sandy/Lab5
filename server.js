
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const CWA_API_KEY = process.env.CWA_API_KEY;
const MOENV_API_KEY = process.env.MOENV_API_KEY;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

const allowedOrigins = new Set([
  ...(FRONTEND_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  "http://127.0.0.1:5500",
  "http://localhost:5500",
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && allowedOrigins.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/cwa", async (_req, res) => {
  if (!CWA_API_KEY) {
    return res.status(500).json({
      error: "CWA_API_KEY is not configured on the server."
    });
  }

  try {
    const url = new URL(
      "https://opendata.cwa.gov.tw/api/v1/rest/datastore/O-A0001-001"
    );
    url.searchParams.set("Authorization", CWA_API_KEY);
    url.searchParams.set("format", "JSON");

    const upstream = await fetch(url, {
      headers: { Accept: "application/json" }
    });
    const body = await upstream.text();

    res.status(upstream.status);
    res.type(upstream.headers.get("content-type") || "application/json");
    res.send(body);
  } catch (err) {
    console.error("CWA proxy error:", err.message);
    res.status(502).json({
      error: "Unable to retrieve CWA data."
    });
  }
});

app.get("/api/aqi", async (_req, res) => {
  if (!MOENV_API_KEY) {
    return res.status(500).json({
      error: "MOENV_API_KEY is not configured on the server."
    });
  }

  try {
    const url = new URL("https://data.moenv.gov.tw/api/v2/aqx_p_432");
    url.searchParams.set("api_key", MOENV_API_KEY);
    url.searchParams.set("limit", "1000");
    url.searchParams.set("sort", "ImportDate desc");
    url.searchParams.set("format", "JSON");

    const upstream = await fetch(url, {
      headers: { Accept: "application/json" }
    });
    const body = await upstream.text();

    res.status(upstream.status);
    res.type(upstream.headers.get("content-type") || "application/json");
    res.send(body);
  } catch (err) {
    console.error("MOENV proxy error:", err.message);
    res.status(502).json({
      error: "Unable to retrieve MOENV AQI data."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
