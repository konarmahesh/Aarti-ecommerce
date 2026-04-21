/* ═══════════════════════════════════════════
   admin-products.js — Products CRUD
═══════════════════════════════════════════ */

let prodSearch='', prodCatFilter='';

function renderProducts(){
  const pf=document.getElementById('prod-cat-filter');
  pf.innerHTML='<option value="">All Categories</option>'+DB.categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  document.getElementById('pm-cat').innerHTML=DB.categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  let list=DB.products;
  if(prodSearch) list=list.filter(p=>(p.name+getCatName(p.cat)+(p.sku||'')).toLowerCase().includes(prodSearch));
  if(prodCatFilter) list=list.filter(p=>p.cat===prodCatFilter);
  const tbody=document.getElementById('products-table');
  if(!list.length){tbody.innerHTML=`<tr><td colspan="9"><div class="empty"><div class="empty-icon">📦</div><h3>No products found</h3><p>Add your first product</p></div></td></tr>`;return;}
  tbody.innerHTML=list.map(p=>{
    const disc=p.oldPrice&&+p.oldPrice>+p.price?Math.round((1-p.price/p.oldPrice)*100):0;
    const imgHtml=p.imgUrl?`<img src="${p.imgUrl}" style="width:44px;height:44px;border-radius:8px;object-fit:cover;border:1px solid var(--border)" onerror="this.style.display='none'">`:`<div class="prod-thumb">${esc(p.emoji)||'📦'}</div>`;
    return`<tr>
      <td style="width:56px">${imgHtml}</td>
      <td><div class="info-cell"><div><strong>${esc(p.name)}</strong><br><span style="font-size:.72rem;color:var(--text3)">${esc(p.sku||'')}</span></div></div></td>
      <td>${esc(getCatEmoji(p.cat))} ${esc(getCatName(p.cat))}</td>
      <td class="price-tag">${fmt(p.price)}</td>
      <td><span class="price-old">${p.oldPrice?fmt(p.oldPrice):'—'}</span></td>
      <td>${disc?`<span class="disc-badge">${disc}% off</span>`:'—'}</td>
      <td>${stockBadge(p.stock)}</td>
      <td>${statusBadge(p.status)}</td>
      <td><div style="display:flex;gap:4px">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editProduct('${p.id}')">✏️</button>
        <button class="btn btn-red btn-sm btn-icon" onclick="deleteProduct('${p.id}','${esc(p.name)}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('');
}

function filterProducts(v){ prodSearch=v.toLowerCase(); renderProducts(); }
function filterProductsByCat(v){ prodCatFilter=v; renderProducts(); }

function openProductModal(id){
  document.getElementById('product-modal-title').textContent=id?'Edit Product':'Add Product';
  document.getElementById('pm-cat').innerHTML=DB.categories.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  if(id){
    const p=DB.products.find(x=>x.id===id); if(!p)return;
    ['id','name','price','oldprice','stock','emoji','sku','desc'].forEach(f=>{
      const el=document.getElementById('pm-'+f);
      if(el) el.value=p[f==='id'?'id':f==='oldprice'?'oldPrice':f]||'';
    });
    document.getElementById('pm-status').value=p.status||'active';
    document.getElementById('pm-cat').value=p.cat;
    document.getElementById('pm-imgurl').value=p.imgUrl||'';
    if(p.imgUrl){showImagePreview(p.imgUrl);}else{clearImage();}
  } else {
    document.getElementById('pm-id').value='';
    ['pm-name','pm-price','pm-oldprice','pm-stock','pm-emoji','pm-sku','pm-desc'].forEach(f=>document.getElementById(f).value='');
    document.getElementById('pm-status').value='active';
    document.getElementById('pm-imgurl').value='';
    clearImage();
  }
  openModal('product-modal');
}

function editProduct(id){ openProductModal(id); }

async function saveProduct(){
  const name=document.getElementById('pm-name').value.trim();
  const price=document.getElementById('pm-price').value;
  const stock=document.getElementById('pm-stock').value;
  const cat=document.getElementById('pm-cat').value;
  if(!name||!price||stock===''||!cat){toast('Please fill all required fields','error');return;}
  const id=document.getElementById('pm-id').value;
  const obj={
    id:id||uid(),name,cat,
    emoji:document.getElementById('pm-emoji').value.trim()||'📦',
    price:+price,
    oldPrice:+document.getElementById('pm-oldprice').value||null,
    stock:+stock,
    sku:document.getElementById('pm-sku').value.trim(),
    desc:document.getElementById('pm-desc').value.trim(),
    status:document.getElementById('pm-status').value,
    imgUrl:document.getElementById('pm-imgurl').value.trim()||''
  };
  if(id){const i=DB.products.findIndex(x=>x.id===id);if(i>-1)DB.products[i]=obj;}
  else DB.products.push(obj);
  await saveDB(); closeModal('product-modal'); renderProducts(); updateBadges();
  toast(id?'✓ Product updated!':'✓ Product added!','success');
}

function deleteProduct(id,name){
  showConfirm('Delete Product',`Delete <strong>${esc(name)}</strong>?`,async()=>{
    DB.products=DB.products.filter(x=>x.id!==id);
    await saveDB(); renderProducts(); updateBadges(); toast('Product deleted','info');
  });
}
