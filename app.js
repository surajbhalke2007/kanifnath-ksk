/* Kanifnath KSK - Google Sheets live rate reader
   Uses Google's Visualization JSONP endpoint (avoids browser CORS fetch errors).
   The sheet must be shared as Anyone with the link: Viewer, or Published to web.
*/
const SHEET_ID = "1w6BZ7r7aB4ex6xsPWr0pA-WwqMdZcQkfqhZUrtTUi1c";
const GID = "0";
const REFRESH_EVERY_MS = 15000; // refresh every 15 seconds while app is open

const ITEM_HEADERS = ["item name", "item", "product name", "product", "name", "वस्तूचे नाव", "मालाचे नाव"];
const PUR_HEADERS = ["purret", "purchase rate", "purchase", "purchase price", "खरेदी दर"];
const SALES_HEADERS = ["salesret", "sales rate", "sale rate", "selling rate", "sales price", "विक्री दर"];

const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
let rows = [], headers = [], itemCol = -1, purCol = -1, salesCol = -1;
let lastUpdated = null, loading = false;

function norm(s) { return String(s ?? "").trim().toLowerCase().replace(/[\s_\-().]/g, ""); }
function findCol(list, aliases) { return list.findIndex(h => aliases.some(a => norm(h) === norm(a))); }
function safeText(value) { return String(value ?? "").trim() || "—"; }
function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}
function render() {
  const q = norm(searchInput.value);
  const found = rows.filter(r => !q || norm(r[itemCol]).includes(q));
  results.replaceChildren();
  countEl.textContent = `${found.length} item(s)`;
  if (!found.length) {
    results.append(el("div", "empty", rows.length ? "No matching item found. Try another spelling." : "No rates loaded. Check Google Sheet sharing and column headings."));
    return;
  }
  found.slice(0, 300).forEach(r => {
    const card = el("article", "item-card");
    card.append(el("h3", "item-title", safeText(r[itemCol])));
    const grid = el("div", "rate-grid");
    const a = el("div", "rate");
    a.append(el("div", "rate-label", "PURCHASE RATE / PurRet"));
    a.append(el("div", "rate-value", safeText(r[purCol])));
    const b = el("div", "rate sales");
    b.append(el("div", "rate-label", "SALES RATE / SalesRet"));
    b.append(el("div", "rate-value", safeText(r[salesCol])));
    grid.append(a, b); card.append(grid);
    const more = el("div", "more");
    headers.forEach((h, i) => {
      if (i === itemCol || i === purCol || i === salesCol) return;
      const value = safeText(r[i]);
      if (value === "—") return;
      const line = el("div", "more-row");
      line.append(el("span", "", h), el("span", "", value));
      more.append(line);
    });
    if (more.childElementCount) card.append(more);
    results.append(card);
  });
}
function setStatus(message, error = false) {
  statusEl.textContent = message;
  statusEl.style.color = error ? "#b42318" : "";
}
function loadFromGoogle() {
  if (loading) return;
  loading = true;
  setStatus("Connecting to Google Sheets…");
  const callbackName = "kanifnathSheetCallback" + Date.now() + Math.floor(Math.random() * 10000);
  let finished = false;
  const script = document.createElement("script");
  const cleanup = () => {
    if (finished) return;
    finished = true;
    loading = false;
    clearTimeout(timer);
    script.remove();
    try { delete window[callbackName]; } catch (_) { window[callbackName] = undefined; }
  };
  const timer = setTimeout(() => {
    cleanup();
    setStatus("Google Sheet did not respond. Check sharing / internet and try again.", true);
  }, 20000);

  window[callbackName] = response => {
    if (finished) return;
    try {
      if (!response || response.status !== "ok") {
        const msg = response?.errors?.map(e => e.detailed_message || e.message).join("; ") || "Google Sheets returned an error.";
        throw new Error(msg);
      }
      const table = response.table;
      const newHeaders = table.cols.map((c, i) => String(c.label || c.id || `Column ${i + 1}`).trim());
      const newRows = table.rows.map(row => newHeaders.map((_, i) => {
        const cell = row.c?.[i];
        if (!cell) return "";
        // Prefer Google's formatted display (e.g. currency/decimal formatting).
        return cell.f !== null && cell.f !== undefined ? String(cell.f) : (cell.v === null || cell.v === undefined ? "" : String(cell.v));
      }));
      const newItemCol = findCol(newHeaders, ITEM_HEADERS);
      const newPurCol = findCol(newHeaders, PUR_HEADERS);
      const newSalesCol = findCol(newHeaders, SALES_HEADERS);
      if (newItemCol < 0 || newPurCol < 0 || newSalesCol < 0) {
        throw new Error("Column headings not found. Row 1 must include Item Name, PurRet and SalesRet. Check exact headings in your sheet.");
      }
      headers = newHeaders; rows = newRows;
      itemCol = newItemCol; purCol = newPurCol; salesCol = newSalesCol;
      lastUpdated = new Date();
      render();
      setStatus(`LIVE · Updated ${lastUpdated.toLocaleTimeString()} · Auto-refresh every 15 seconds`);
      cleanup();
    } catch (err) {
      cleanup();
      setStatus(`Update failed: ${err.message}`, true);
      console.error(err);
      // Keep last successfully loaded rates visible if a later refresh fails.
      render();
    }
  };
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${encodeURIComponent(GID)}&tqx=${encodeURIComponent(`out:json;responseHandler:${callbackName};reqId:0`)}&_=${Date.now()}`;
  script.src = url;
  script.onerror = () => {
    cleanup();
    setStatus("Could not access Google Sheet. Set sharing to Anyone with the link – Viewer.", true);
  };
  document.head.appendChild(script);
}

searchInput.addEventListener("input", render);
document.getElementById("refreshBtn").addEventListener("click", loadFromGoogle);
loadFromGoogle();
setInterval(() => { if (!document.hidden) loadFromGoogle(); }, REFRESH_EVERY_MS);
document.addEventListener("visibilitychange", () => { if (!document.hidden) loadFromGoogle(); });
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("./service-worker.js").catch(err => console.warn("Service worker:", err));
}
