/* admin-orders.js */
let orderSearch='';
function renderOrders(){
  const oc=document.getElementById('om-customer');
  oc.innerHTML=DB.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  const op=document.getElementById('om-product');
  op.innerHTML=DB.products.map(p=>`<option value="${p.id}" data-price="${p.price}">${esc(p.name)} — ${fmt(p.price)}</option>`).join('');
  op.onchange=()=>{const s=op.options[op.selectedIndex];document.getElementById('om-amount').value=s.dataset.price||'';};
  let list=DB.orders;
  if(orderSearch) list=list.filter(o=>{const cn=(DB.customers.find(x=>x.id===o.custId)||{}).name||'';const pn=(DB.products.find(x=>x.id===o.prodId)||{}).name||'';return[o.orderId,cn,pn].join(' ').toLowerCase().includes(orderSearch);});
  const tbody=document.getElementById('orders-table');
  if(!list.length){tbody.innerHTML=`<tr><td colspan="8"><div class="empty"><div class="empty-icon">🧾</div><h3>No orders yet</h3></div></td></tr>`;return;}
  tbody.innerHTML=list.map(o=>{
    const cust=DB.customers.find(x=>x.id===o.custId);
    const prod=DB.products.find(x=>x.id===o.prodId);
    return`<tr>
      <td><strong>${esc(o.orderId)}</strong></td>
      <td>${cust?`<div class="info-cell"><div class="user-avatar">${esc((cust.name||'?')[0].toUpperCase())}</div>${esc(cust.name)}</div>`:'—'}</td>
      <td>${prod?`${esc(prod.emoji)} ${esc(prod.name)}`:'—'}</td>
      <td style="text-align:center;font-weight:700">${o.qty}</td>
      <td class="price-tag">${fmt(o.amount)}</td>
      <td>${statusBadge(o.status)}</td>
      <td style="color:var(--text3);font-size:.78rem">${esc(o.date)}</td>
      <td><div style="display:flex;gap:4px">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editOrder('${o.id}')">✏️</button>
        <button class="btn btn-red btn-sm btn-icon" onclick="deleteOrder('${o.id}','${esc(o.orderId)}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('');
}
function filterOrders(v){orderSearch=v.toLowerCase();renderOrders();}
function openOrderModal(id){
  document.getElementById('order-modal-title').textContent=id?'Edit Order':'Add Order';
  const oc=document.getElementById('om-customer');
  oc.innerHTML=DB.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
  const op=document.getElementById('om-product');
  op.innerHTML=DB.products.map(p=>`<option value="${p.id}" data-price="${p.price}">${esc(p.name)} — ${fmt(p.price)}</option>`).join('');
  op.onchange=()=>{const s=op.options[op.selectedIndex];document.getElementById('om-amount').value=s.dataset.price||'';};
  if(id){
    const o=DB.orders.find(x=>x.id===id);if(!o)return;
    document.getElementById('om-id').value=o.id;oc.value=o.custId;op.value=o.prodId;document.getElementById('om-qty').value=o.qty;document.getElementById('om-amount').value=o.amount;document.getElementById('om-status').value=o.status;document.getElementById('om-payment').value=o.payment;document.getElementById('om-date').value=o.date;
  }else{
    document.getElementById('om-id').value='';document.getElementById('om-qty').value=1;document.getElementById('om-amount').value='';document.getElementById('om-status').value='pending';document.getElementById('om-date').value=dateStr();
    if(op.options.length){document.getElementById('om-amount').value=op.options[0].dataset.price||'';}
  }
  openModal('order-modal');
}
function editOrder(id){openOrderModal(id);}
async function saveOrder(){
  const custId=document.getElementById('om-customer').value;
  const prodId=document.getElementById('om-product').value;
  const qty=document.getElementById('om-qty').value;
  const amount=document.getElementById('om-amount').value;
  if(!custId||!prodId||!qty||!amount){toast('Please fill all required fields','error');return;}
  const id=document.getElementById('om-id').value;
  const counter='#ART-'+(1000+DB.orders.length+1);
  const obj={id:id||uid(),orderId:id?(DB.orders.find(x=>x.id===id)||{}).orderId||counter:counter,custId,prodId,qty:+qty,amount:+amount,status:document.getElementById('om-status').value,payment:document.getElementById('om-payment').value,date:document.getElementById('om-date').value||dateStr()};
  if(id){const i=DB.orders.findIndex(x=>x.id===id);if(i>-1)DB.orders[i]=obj;}
  else DB.orders.push(obj);
  await saveDB();closeModal('order-modal');renderOrders();updateBadges();
  toast(id?'✓ Order updated!':'✓ Order added!','success');
}
function deleteOrder(id,orderId){
  showConfirm('Delete Order',`Delete order <strong>${esc(orderId)}</strong>?`,async()=>{
    DB.orders=DB.orders.filter(x=>x.id!==id);
    await saveDB();renderOrders();updateBadges();toast('Order deleted','info');
  });
}
