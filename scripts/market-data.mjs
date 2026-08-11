import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

loadEnv({ path: path.join(rootDir, ".env.local") });

const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing ALPHA_VANTAGE_API_KEY in .env.local."
  );
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (data.Note || data.Information) {
    throw new Error(data.Note || data.Information);
  }

  return data;
}

async function getQuote(symbol, name) {
  const url =
    `https://www.alphavantage.co/query` +
    `?function=GLOBAL_QUOTE` +
    `&symbol=${encodeURIComponent(symbol)}` +
    `&apikey=${apiKey}`;

  const data = await fetchJSON(url);
  const quote = data["Global Quote"];

  if (!quote || !quote["05. price"]) {
    throw new Error(`No quote returned for ${symbol}`);
  }

  const price = Number(quote["05. price"]);

  const changePercent = parseFloat(
    String(
      quote["10. change percent"] || "0"
    ).replace("%", "")
  );

  return {
    name,
    value: Number.isFinite(price)
      ? price.toLocaleString("en-CA", {
          maximumFractionDigits: 2,
        })
      : "N/A",
    changePercent: Number.isFinite(changePercent)
      ? changePercent
      : null,
    positive: Number.isFinite(changePercent)
      ? changePercent >= 0
      : null,
  };
}

async function getCadUsd() {
  const url =
    `https://www.alphavantage.co/query` +
    `?function=CURRENCY_EXCHANGE_RATE` +
    `&from_currency=CAD` +
    `&to_currency=USD` +
    `&apikey=${apiKey}`;

  const data = await fetchJSON(url);

  const rate =
    data["Realtime Currency Exchange Rate"];

  const value = Number(
    rate?.["5. Exchange Rate"]
  );

  if (!Number.isFinite(value)) {
    throw new Error(
      "No CAD/USD exchange rate returned."
    );
  }

  return {
    name: "CAD / USD",
    value: value.toFixed(4),
    changePercent: null,
    positive: null,
  };
}

async function safeFetch(label, fn) {
  try {
    return await fn();
  } catch (error) {
    console.error(
      `⚠️ ${label} unavailable: ${error.message}`
    );

    return {
      name: label,
      value: "N/A",
      changePercent: null,
      positive: null,
    };
  }
}

export async function collectMarketData() {
  console.log("Collecting market data...");

  // TSX proxy
  const tsx = await safeFetch("TSX", () =>
    getQuote("XIU.TRT", "TSX")
  );

  console.log("Waiting for Alpha Vantage rate limit...");
  await sleep(1500);

  // S&P 500 proxy
  const sp500 = await safeFetch(
    "S&P 500",
    () => getQuote("SPY", "S&P 500")
  );

  console.log("Waiting for Alpha Vantage rate limit...");
  await sleep(1500);

  // Oil proxy
  const oil = await safeFetch(
    "Oil",
    () => getQuote("USO", "Oil")
  );

  console.log("Waiting for Alpha Vantage rate limit...");
  await sleep(1500);

  // CAD/USD
  const cadUsd = await safeFetch(
    "CAD / USD",
    getCadUsd
  );

  return {
    items: [
      tsx,
      sp500,
      oil,
      cadUsd,
    ],
  };
}

// ---------------------------------------------------------
// TEST MODE
// Run:
// node scripts/market-data.mjs
// ---------------------------------------------------------

if (path.resolve(process.argv[1]) === __filename) {
  const markets = await collectMarketData();

  console.log("\nMarket data:\n");

  for (const item of markets.items) {
    const change =
      item.changePercent == null
        ? ""
        : ` (${
            item.changePercent >= 0 ? "+" : ""
          }${item.changePercent.toFixed(2)}%)`;

    console.log(
      `${item.name}: ${item.value}${change}`
    );
  }

  console.log("\nMarket test complete.");
}