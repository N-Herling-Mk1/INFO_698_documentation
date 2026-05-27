/* ===========================================================
   FORGE INFO 698 — data.js
   Fetch helpers, simple in-memory cache
   =========================================================== */

const DataStore = (() => {
  const cache = new Map();

  async function fetchText(url) {
    if (cache.has(url)) return cache.get(url);
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
    const text = await r.text();
    cache.set(url, text);
    return text;
  }

  async function fetchJSON(url) {
    if (cache.has(url)) return cache.get(url);
    const r = await fetch(url);
    if (!r.ok) throw new Error(`Failed to fetch ${url}: ${r.status}`);
    const json = await r.json();
    cache.set(url, json);
    return json;
  }

  return { fetchText, fetchJSON };
})();
