/* ═══════════════════════════════════════════
   admin-db.js — Data load/save/seed
═══════════════════════════════════════════ */

let DB = { categories:[], products:[], customers:[], orders:[] };

function uid(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
function dateStr(){ return new Date().toISOString().slice(0,10); }
function fmt(n){ return '₹'+(+n||0).toLocaleString('en-IN'); }
function esc(s){ return String(s||'').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function getCatName(id){ const c=DB.categories.find(x=>x.id===id); return c?c.name:'—'; }
function getCatEmoji(id){ const c=DB.categories.find(x=>x.id===id); return c?c.emoji:'📦'; }

function stockBadge(n){
  n=+n;
  if(n===0) return`<span class="badge badge-out">Out of Stock</span>`;
  if(n<30)  return`<span class="badge badge-low">Low (${n})</span>`;
  return`<span class="badge badge-instock">${n} in Stock</span>`;
}
function statusBadge(s){
  const m={active:'badge-active',inactive:'badge-inactive',delivered:'badge-instock',shipped:'badge-new',processing:'badge-low',pending:'badge-inactive',cancelled:'badge-out'};
  return`<span class="badge ${m[s]||'badge-inactive'}">${esc(s)}</span>`;
}

async function loadDB() {
  try {
    const r = await window.storage.get('aarti-db');
    if (r && r.value) { DB = JSON.parse(r.value); return; }
  } catch(e) {}
  await seedDefaults();
}

async function saveDB() {
  try { await window.storage.set('aarti-db', JSON.stringify(DB)); }
  catch(e) { toast('⚠ Could not save data', 'error'); }
}

async function seedDefaults() {
  DB.categories = [
    {id:uid(),name:'Agarbatti',       emoji:'🌸',desc:'Incense sticks',        status:'active'},
    {id:uid(),name:'Copper Idols',    emoji:'🏺',desc:'Copper deity idols',    status:'active'},
    {id:uid(),name:'Handmade Candles',emoji:'🕯️',desc:'Beeswax & soy candles', status:'active'},
    {id:uid(),name:'Dhoop',           emoji:'🌿',desc:'Dhoop cones & sticks',  status:'active'},
    {id:uid(),name:'Pooja Thali',     emoji:'🪷',desc:'Pooja thali sets',      status:'active'},
    {id:uid(),name:'Pooja Items',     emoji:'🛕',desc:'Pooja accessories',     status:'active'},
  ];
  DB.products = [
    {id:uid(),name:'Sandalwood Agarbatti', cat:DB.categories[0].id,emoji:'🌸',price:299, oldPrice:399, stock:847,sku:'ART-AGB-001',desc:'Premium sandalwood incense sticks',status:'active',imgUrl:''},
    {id:uid(),name:'Copper Ganesha Idol',  cat:DB.categories[1].id,emoji:'🏺',price:1849,oldPrice:2499,stock:23, sku:'ART-IDL-001',desc:'Handcrafted copper Ganesha, 6 inches',status:'active',imgUrl:''},
    {id:uid(),name:'Beeswax Candle Set',   cat:DB.categories[2].id,emoji:'🕯️',price:649, oldPrice:849, stock:185,sku:'ART-CND-001',desc:'6 hand-poured beeswax candles',status:'active',imgUrl:''},
    {id:uid(),name:'Rose Dhoop Cones',     cat:DB.categories[3].id,emoji:'🌹',price:199, oldPrice:249, stock:0,  sku:'ART-DHP-001',desc:'20 natural rose dhoop cones',status:'active',imgUrl:''},
    {id:uid(),name:'Brass Pooja Thali Set',cat:DB.categories[4].id,emoji:'🪷',price:2249,oldPrice:2999,stock:54, sku:'ART-THI-001',desc:'7-piece complete brass thali',status:'active',imgUrl:''},
  ];
  DB.customers = [
    {id:uid(),name:'Meera Sharma', phone:'+91 98765 00001',email:'meera@example.com', city:'Delhi',     state:'Delhi',    spent:12450,orders:8, status:'active',notes:'',added:dateStr()},
    {id:uid(),name:'Rajesh Patel', phone:'+91 98765 00002',email:'rajesh@example.com',city:'Ahmedabad', state:'Gujarat',  spent:8990, orders:5, status:'active',notes:'',added:dateStr()},
    {id:uid(),name:'Sunita Devi',  phone:'+91 98765 00003',email:'sunita@example.com',city:'Jaipur',    state:'Rajasthan',spent:24300,orders:12,status:'active',notes:'VIP customer',added:dateStr()},
  ];
  DB.orders = [
    {id:uid(),orderId:'#ART-1001',custId:DB.customers[2].id,prodId:DB.products[0].id,qty:2,amount:598, status:'delivered', payment:'UPI', date:dateStr()},
    {id:uid(),orderId:'#ART-1002',custId:DB.customers[1].id,prodId:DB.products[1].id,qty:1,amount:1849,status:'shipped',    payment:'Card',date:dateStr()},
    {id:uid(),orderId:'#ART-1003',custId:DB.customers[0].id,prodId:DB.products[4].id,qty:1,amount:2249,status:'processing', payment:'UPI', date:dateStr()},
  ];
  await saveDB();
}
