/* ═══════════════════════════════════════════
   admin-ui.js — UI helpers: modals, toast, image, clock, nav
═══════════════════════════════════════════ */

let confirmCb = null;

// ── DB Banner ──
function updateDbBanner(){
  const banner=document.getElementById('db-banner');
  const dot=document.getElementById('db-dot');
  const text=document.getElementById('db-status-text');
  if(_usingFirebase){
    banner.className='db-banner firebase';dot.className='status-dot dot-firebase';
    text.textContent='✅ Connected to Firebase (Google Cloud) — data saved permanently';
  }else{
    banner.className='db-banner local';dot.className='status-dot dot-local';
    text.innerHTML='⚠️ Using Local Storage — data saved on this browser only. <strong>Go to ⚙️ Firebase Setup</strong> to connect cloud database.';
  }
}

// ── Badges ──
function updateBadges(){
  document.getElementById('badge-products').textContent  = DB.products.length;
  document.getElementById('badge-categories').textContent= DB.categories.length;
  document.getElementById('badge-customers').textContent = DB.customers.length;
  document.getElementById('badge-orders').textContent    = DB.orders.length;
  document.getElementById('d-products').textContent  = DB.products.length;
  document.getElementById('d-customers').textContent = DB.customers.length;
  document.getElementById('d-categories').textContent= DB.categories.length;
  document.getElementById('d-orders').textContent    = DB.orders.length;
}

// ── Dashboard ──
function renderDashboard(){
  updateBadges();
  const dp=document.getElementById('dash-products');
  const recent=[...DB.products].slice(-5).reverse();
  dp.innerHTML=recent.length?recent.map(p=>`<tr><td><div class="info-cell"><div class="prod-thumb">${esc(p.emoji)||'📦'}</div><span>${esc(p.name)}</span></div></td><td class="price-tag">${fmt(p.price)}</td><td>${stockBadge(p.stock)}</td></tr>`).join(''):`<tr><td colspan="3" style="text-align:center;padding:1.5rem;color:var(--text3)">No products yet</td></tr>`;
  const dc=document.getElementById('dash-customers');
  const rc=[...DB.customers].slice(-5).reverse();
  dc.innerHTML=rc.length?rc.map(c=>`<tr><td><div class="info-cell"><div class="user-avatar">${esc((c.name||'?')[0].toUpperCase())}</div><span>${esc(c.name)}</span></div></td><td>${esc(c.phone)}</td><td style="color:var(--text3);font-size:.78rem">${esc(c.added||'')}</td></tr>`).join(''):`<tr><td colspan="3" style="text-align:center;padding:1.5rem;color:var(--text3)">No customers yet</td></tr>`;
}

// ── Navigation ──
function goPanel(name, el){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.sb-item').forEach(i=>i.classList.remove('active'));
  const panel=document.getElementById('panel-'+name);
  if(panel) panel.classList.add('active');
  if(el) el.classList.add('active');
  else document.querySelectorAll('.sb-item').forEach(i=>{ if((i.getAttribute('onclick')||'').includes("'"+name+"'")) i.classList.add('active'); });
  const T={dashboard:'Dashboard',products:'Products',categories:'Categories',customers:'Customer Database',orders:'Orders',setup:'Firebase Setup'};
  document.getElementById('topbar-title').textContent=T[name]||name;
  if(name==='dashboard') renderDashboard();
  if(name==='products')  renderProducts();
  if(name==='categories')renderCategories();
  if(name==='customers') renderCustomers();
  if(name==='orders')    renderOrders();
}

// ── Modals ──
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.overlay').forEach(o=>{
    o.addEventListener('click',e=>{if(e.target===o&&o.id!=='confirm-overlay')o.classList.remove('open');});
  });
});

// ── Confirm Dialog ──
function showConfirm(title, msg, cb){
  document.getElementById('confirm-title').textContent=title;
  document.getElementById('confirm-msg').innerHTML=msg;
  confirmCb=cb;
  document.getElementById('confirm-overlay').classList.add('open');
  document.getElementById('confirm-yes').onclick=()=>{closeConfirm();if(confirmCb)confirmCb();};
}
function closeConfirm(){ document.getElementById('confirm-overlay').classList.remove('open'); confirmCb=null; }

// ── Toast ──
let toastTimer;
function toast(msg, type='success'){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='toast '+type+' show';
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove('show'),3000);
}

// ── Image Upload (Cloudinary) ──
const CLOUDINARY_CLOUD = 'dzjvqd1pf';
const CLOUDINARY_PRESET = 'aarti_upload';
let _uploadedImgUrl = '';

function showImagePreview(url){
  const preview=document.getElementById('img-preview');
  const placeholder=document.getElementById('img-placeholder');
  const area=document.getElementById('img-upload-area');
  const clearBtn=document.getElementById('img-clear-btn');
  preview.src=url; preview.style.display='block';
  placeholder.style.display='none'; area.classList.add('has-img');
  if(clearBtn) clearBtn.style.display='inline-flex';
}
function clearImage(){
  const preview=document.getElementById('img-preview');
  const placeholder=document.getElementById('img-placeholder');
  const area=document.getElementById('img-upload-area');
  const clearBtn=document.getElementById('img-clear-btn');
  const status=document.getElementById('img-status');
  preview.src=''; preview.style.display='none';
  placeholder.style.display='block'; area.classList.remove('has-img');
  if(clearBtn) clearBtn.style.display='none';
  status.textContent=''; status.className='img-status';
  document.getElementById('pm-imgurl').value='';
  try{ document.getElementById('pm-image-file').value=''; }catch(e){}
  _uploadedImgUrl='';
}
function handleUrlInput(url){
  if(url.trim()){showImagePreview(url.trim());_uploadedImgUrl=url.trim();document.getElementById('pm-imgurl').value=url.trim();}
  else{clearImage();}
}
async function handleImageSelect(event){
  const file=event.target.files[0]; if(!file)return;
  if(file.size>10*1024*1024){toast('Image must be under 10MB','error');return;}
  const status=document.getElementById('img-status');
  const progressWrap=document.getElementById('img-progress');
  const progressBar=document.getElementById('img-progress-bar');
  const reader=new FileReader();
  reader.onload=e=>showImagePreview(e.target.result);
  reader.readAsDataURL(file);
  try{
    progressWrap.style.display='block'; progressBar.style.width='0%';
    status.textContent='⏳ Uploading to Cloudinary…'; status.className='img-status uploading';
    const formData=new FormData();
    formData.append('file',file); formData.append('upload_preset',CLOUDINARY_PRESET); formData.append('folder','aarti_products');
    const xhr=new XMLHttpRequest();
    xhr.open('POST',`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`);
    xhr.upload.onprogress=e=>{if(e.lengthComputable){progressBar.style.width=Math.round(e.loaded/e.total*100)+'%';}};
    xhr.onload=()=>{
      if(xhr.status===200){
        const res=JSON.parse(xhr.responseText);
        _uploadedImgUrl=res.secure_url; document.getElementById('pm-imgurl').value=res.secure_url;
        progressWrap.style.display='none'; status.textContent='✅ Uploaded successfully!'; status.className='img-status done';
        showImagePreview(res.secure_url); toast('✓ Image uploaded!','success');
      }else{
        const err=JSON.parse(xhr.responseText);
        status.textContent='✕ Upload failed: '+(err.error?.message||'Unknown error'); status.className='img-status error'; progressWrap.style.display='none';
      }
    };
    xhr.onerror=()=>{status.textContent='✕ Network error.';status.className='img-status error';progressWrap.style.display='none';};
    xhr.send(formData);
  }catch(e){status.textContent='✕ '+e.message;status.className='img-status error';progressWrap.style.display='none';}
}

// ── Clock ──
function updateClock(){ document.getElementById('clock').textContent=new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}); }
setInterval(updateClock,1000); updateClock();
