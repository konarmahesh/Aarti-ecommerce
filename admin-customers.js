/* admin-customers.js */
let custSearch='';
function renderCustomers(){
  let list=DB.customers;
  if(custSearch) list=list.filter(c=>[c.name,c.phone,c.email,c.city].join(' ').toLowerCase().includes(custSearch));
  const tbody=document.getElementById('customers-table');
  if(!list.length){tbody.innerHTML=`<tr><td colspan="9"><div class="empty"><div class="empty-icon">👥</div><h3>No customers yet</h3><p>Add your first customer</p></div></td></tr>`;return;}
  tbody.innerHTML=list.map(c=>`<tr>
    <td><div class="info-cell"><div class="user-avatar">${esc((c.name||'?')[0].toUpperCase())}</div><div><strong>${esc(c.name)}</strong>${c.notes?`<br><span style="font-size:.72rem;color:var(--text3)">${esc(c.notes.slice(0,30))}</span>`:''}</div></div></td>
    <td>${esc(c.email)||'—'}</td><td>${esc(c.phone)}</td>
    <td>${esc(c.city)||'—'}${c.state?', '+esc(c.state):''}</td>
    <td style="text-align:center;font-weight:700">${+c.orders||0}</td>
    <td class="price-tag">${fmt(c.spent)}</td>
    <td>${statusBadge(c.status)}</td>
    <td style="color:var(--text3);font-size:.78rem">${esc(c.added||'')}</td>
    <td><div style="display:flex;gap:4px">
      <button class="btn btn-ghost btn-sm btn-icon" onclick="editCustomer('${c.id}')">✏️</button>
      <button class="btn btn-red btn-sm btn-icon" onclick="deleteCustomer('${c.id}','${esc(c.name)}')">🗑</button>
    </div></td>
  </tr>`).join('');
}
function filterCustomers(v){custSearch=v.toLowerCase();renderCustomers();}
function openCustomerModal(id){
  document.getElementById('cust-modal-title').textContent=id?'Edit Customer':'Add Customer';
  if(id){
    const c=DB.customers.find(x=>x.id===id);if(!c)return;
    document.getElementById('cu-id').value=c.id;document.getElementById('cu-name').value=c.name;document.getElementById('cu-phone').value=c.phone;document.getElementById('cu-email').value=c.email||'';document.getElementById('cu-city').value=c.city||'';document.getElementById('cu-state').value=c.state||'';document.getElementById('cu-spent').value=c.spent||0;document.getElementById('cu-orders').value=c.orders||0;document.getElementById('cu-status').value=c.status||'active';document.getElementById('cu-notes').value=c.notes||'';
  }else{
    document.getElementById('cu-id').value='';['cu-name','cu-phone','cu-email','cu-city','cu-state','cu-notes'].forEach(f=>document.getElementById(f).value='');document.getElementById('cu-spent').value=0;document.getElementById('cu-orders').value=0;document.getElementById('cu-status').value='active';
  }
  openModal('customer-modal');
}
function editCustomer(id){openCustomerModal(id);}
async function saveCustomer(){
  const name=document.getElementById('cu-name').value.trim();
  const phone=document.getElementById('cu-phone').value.trim();
  if(!name||!phone){toast('Name and phone are required','error');return;}
  const id=document.getElementById('cu-id').value;
  const obj={id:id||uid(),name,phone,email:document.getElementById('cu-email').value.trim(),city:document.getElementById('cu-city').value.trim(),state:document.getElementById('cu-state').value.trim(),spent:+document.getElementById('cu-spent').value||0,orders:+document.getElementById('cu-orders').value||0,status:document.getElementById('cu-status').value,notes:document.getElementById('cu-notes').value.trim(),added:id?(DB.customers.find(x=>x.id===id)||{}).added||dateStr():dateStr()};
  if(id){const i=DB.customers.findIndex(x=>x.id===id);if(i>-1)DB.customers[i]=obj;}
  else DB.customers.push(obj);
  await saveDB();closeModal('customer-modal');renderCustomers();updateBadges();
  toast(id?'✓ Customer updated!':'✓ Customer added!','success');
}
function deleteCustomer(id,name){
  showConfirm('Delete Customer',`Delete <strong>${esc(name)}</strong>?`,async()=>{
    DB.customers=DB.customers.filter(x=>x.id!==id);
    await saveDB();renderCustomers();updateBadges();toast('Customer deleted','info');
  });
}
