/*
 * Kanifnath KSK Rate Book
 * Google Sheet should be shared as Viewer or published to the web.
 * Change SHEET_ID / GID below if you use another spreadsheet or tab.
 */
const SHEET_ID = "1w6BZ7r7aB4ex6xsPWr0pA-WwqMdZcQkfqhZUrtTUi1c";
const GID = "0";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${GID}`;

// Header names are matched without case, spaces, underscores or punctuation.
const ITEM_HEADERS = ["item name", "item", "product name", "product", "name", "वस्तूचे नाव", "मालाचे नाव"];
const PUR_HEADERS = ["purret", "purchase rate", "purchase", "purchase price", "खरेदी दर"];
const SALES_HEADERS = ["salesret", "sales rate", "sale rate", "selling rate", "sales price", "विक्री दर"];

const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");
const statusEl = document.getElementById("status");
const countEl = document.getElementById("count");
let rows = [], headers = [], itemCol = -1, purCol = -1, salesCol = -1;

function norm(s){return String(s ?? "").trim().toLowerCase().replace(/[\\s_\\-().]/g,"");}
function findCol(list, aliases){return list.findIndex(h => aliases.some(a => norm(h) === norm(a)));}
function parseCSV(text){
  const out=[]; let row=[], cell="", quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i], n=text[i+1];
    if(c === '"' && quoted && n === '"'){cell+='"';i++;}
    else if(c === '"'){quoted=!quoted;}
    else if(c === "," && !quoted){row.push(cell);cell="";}
    else if((c === "\n" || c === "\r") && !quoted){if(c==="\r"&&n==="\n")i++;row.push(cell);if(row.some(v=>v.trim()))out.push(row);row=[];cell="";}
    else cell+=c;
  }
  row.push(cell);if(row.some(v=>v.trim()))out.push(row);
  return out;
}
function safeText(value){return String(value ?? "").trim() || "—";}
function el(tag, cls, text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
function render(){
  const q=norm(searchInput.value);
  const found=rows.filter(r=>!q || norm(r[itemCol]).includes(q));
  results.replaceChildren();countEl.textContent=`${found.length} item(s)`;
  if(!found.length){results.append(el("div","empty",rows.length?"No matching item found. Try another spelling.":"No rate data loaded yet."));return;}
  found.slice(0,250).forEach(r=>{
    const card=el("article","item-card");
    card.append(el("h3","item-title",safeText(r[itemCol])));
    const grid=el("div","rate-grid");
    const a=el("div","rate");a.append(el("div","rate-label","PURCHASE RATE"));a.append(el("div","rate-value",safeText(r[purCol])));
    const b=el("div","rate sales");b.append(el("div","rate-label","SALES RATE"));b.append(el("div","rate-value",safeText(r[salesCol])));
    grid.append(a,b);card.append(grid);
    const more=el("div","more");
    headers.forEach((h,i)=>{if(i===itemCol||i===purCol||i===salesCol)return;const value=safeText(r[i]);if(value==="—")return;const line=el("div","more-row");line.append(el("span","",h),el("span","",value));more.append(line);});
    if(more.childElementCount)card.append(more);
    results.append(card);
  });
}
async function load(){
  statusEl.textContent="Loading rates…";
  try{
    const response=await fetch(CSV_URL,{cache:"no-store"});
    if(!response.ok)throw new Error(`Google Sheets response: ${response.status}`);
    const parsed=parseCSV(await response.text());
    if(parsed.length<2)throw new Error("Sheet is empty or its first row is not a header.");
    headers=parsed[0].map(x=>x.trim());rows=parsed.slice(1).map(r=>headers.map((_,i)=>r[i]??""));
    itemCol=findCol(headers,ITEM_HEADERS);purCol=findCol(headers,PUR_HEADERS);salesCol=findCol(headers,SALES_HEADERS);
    if(itemCol<0||purCol<0||salesCol<0){
      throw new Error("Required headers not found. Add columns named Item Name, PurRet and SalesRet in row 1, or edit the header aliases in app.js.");
    }
    statusEl.textContent=`Updated from Google Sheet · ${new Date().toLocaleString()}`;
    render();
  }catch(err){
    rows=[];render();statusEl.textContent=err.message;
    console.error(err);
  }
}
searchInput.addEventListener("input",render);
document.getElementById("refreshBtn").addEventListener("click",load);
load();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))navigator.serviceWorker.register("./service-worker.js").catch(console.warn);
