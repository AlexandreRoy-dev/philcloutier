import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BROKER_SLUG,
  FALLBACK_API,
  FALLBACK_KEY,
  SOURCE_PAGE,
  STATE_URL,
  contentSignature,
  decodeJsString,
  normalizeListing,
  sortListings
} from "./lib/listings.mjs";
import { writeGenerated } from "./lib/render.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, "data");
const dataPath = path.join(dataDir, "listings.json");
const offline = process.argv.includes("--offline");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadConfig() {
  const response = await fetch(STATE_URL, {
    headers: { "User-Agent": "philippecloutier.net listings sync" },
    signal: AbortSignal.timeout(20000)
  });
  if (!response.ok) throw new Error("Broker page state " + response.status);
  const text = await response.text();
  const key = text.match(/apiKey:"([^"]+)"/);
  const api = text.match(/apiUrl:"([^"]+)"/);
  if (!key || !api) throw new Error("Public API config was not found on the broker page");
  return { apiUrl: decodeJsString(api[1]), apiKey: decodeJsString(key[1]) };
}

async function apiGet(url, apiKey) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "Content-Language": "fr",
      "X-Header-Api": apiKey,
      "User-Agent": "philippecloutier.net listings sync"
    },
    signal: AbortSignal.timeout(25000)
  });
  if (!response.ok) throw new Error(response.status + " " + url);
  return response.json();
}

async function searchAll(apiUrl, apiKey, brokerId, extra) {
  const items = [];
  let page = 1;
  let last = 1;
  do {
    const params = new URLSearchParams({ BrokerId: String(brokerId), PageSize: "50", page: String(page), ...extra });
    const payload = await apiGet(apiUrl + "inscriptions/search?" + params.toString(), apiKey);
    items.push(...(payload.data || []));
    last = payload.meta && payload.meta.last_page ? payload.meta.last_page : 1;
    page += 1;
  } while (page <= last && page <= 8);
  return items;
}

async function fetchListings() {
  let config;
  try {
    config = await loadConfig();
  } catch (error) {
    console.warn("Live config unavailable, using the public fallback.", error.message);
    config = { apiUrl: FALLBACK_API, apiKey: FALLBACK_KEY };
  }
  const broker = await apiGet(config.apiUrl + "brokers/" + BROKER_SLUG, config.apiKey);
  const brokerId = broker.idagent || broker.code;
  if (!brokerId) throw new Error("Broker id missing");
  const active = await searchAll(config.apiUrl, config.apiKey, brokerId, {});
  await sleep(200);
  const sold = await searchAll(config.apiUrl, config.apiKey, brokerId, { Sold: "1" });
  const byId = new Map();
  for (const item of [...active, ...sold]) byId.set(item.no_inscription, item);
  const listings = [];
  for (const item of byId.values()) {
    await sleep(150);
    const detail = await apiGet(config.apiUrl + "inscriptions/" + item.no_inscription, config.apiKey);
    listings.push(normalizeListing(detail, item));
  }
  return {
    source: SOURCE_PAGE,
    brokerSlug: BROKER_SLUG,
    brokerId,
    syncedAt: new Date().toISOString(),
    listings: sortListings(listings)
  };
}

function readPrevious() {
  if (!fs.existsSync(dataPath)) return null;
  return JSON.parse(fs.readFileSync(dataPath, "utf8"));
}

function publish(payload) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataPath, JSON.stringify(payload, null, 2) + "\n");
  writeGenerated(root, payload.listings, payload.syncedAt);
  console.log("Published " + payload.listings.length + " listings.");
  for (const listing of payload.listings) {
    console.log("- " + listing.centris + " " + listing.statusLabel + " " + (listing.address || "") + " " + (listing.priceDisplay || ""));
  }
}

if (offline) {
  const previous = readPrevious();
  if (!previous) {
    console.error("No data/listings.json snapshot to render.");
    process.exit(1);
  }
  publish(previous);
} else {
  try {
    const payload = await fetchListings();
    const previous = readPrevious();
    if (!payload.listings.length && previous && previous.listings && previous.listings.length) {
      console.warn("The source returned no listings. Keeping the committed snapshot.");
      process.exit(0);
    }
    if (previous && contentSignature(previous) === contentSignature(payload)) {
      console.log("Listings unchanged.");
      process.exit(0);
    }
    publish(payload);
  } catch (error) {
    console.error("Sync failed. The committed snapshot was left in place.");
    console.error(error);
    process.exit(0);
  }
}
