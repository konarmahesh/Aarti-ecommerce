/* admin-categories.js */
let catSearch='';
function renderCategories(){
  let list=DB.categories;
  if(catSearch) list=list.filter(c=>c.name.toLowerCase().includes(catSearch));
  const tbody=document.getElementById('categories-table');
  if(!list.length){tbody.innerHTML=`<tr><td colspan="6"><div class="empty"><div class="empty-icon">🗂️</div><h3>No categories yet</h3></div></td></tr>`;return;}
  tbody.innerHTML=list.map(c=>{
    const count=DB.products.filter(p=>p.cat===c.id).length;
    return`<tr>
      <td style="font-size:1.6rem;text-align:center">${esc(c.emoji)||'📦'}</td>
      <td><strong>${esc(c.name)}</strong></td>
      <td style="color:var(--text3);font-size:.83rem">${esc(c.desc)||'—'}</td>
      <td><span class="badge badge-new">${count} products</span></td>
      <td>${statusBadge(c.status)}</td>
      <td><div style="display:flex;gap:4px">
        <button class="btn btn-ghost btn-sm btn-icon" onclick="editCategory('${c.id}')">✏️</button>
        <button class="btn btn-red btn-sm btn-icon" onclick="deleteCategory('${c.id}','${esc(c.name)}')">🗑</button>
      </div></td>
    </tr>`;
  }).join('');
}
function filterCategories(v){catSearch=v.toLowerCase();renderCategories();}
function openCategoryModal(id){
  document.getElementById('cat-modal-title').textContent=id?'Edit Category':'Add Category';
  if(id){
    const c=DB.categories.find(x=>x.id===id);if(!c)return;
    document.getElementById('cm-id').value=c.id;document.getElementById('cm-name').value=c.name;document.getElementById('cm-emoji').value=c.emoji||'';document.getElementById('cm-desc').value=c.desc||'';document.getElementById('cm-status').value=c.status||'active';
  }else{
    document.getElementById('cm-id').value='';['cm-name','cm-emoji','cm-desc'].forEach(f=>document.getElementById(f).value='');document.getElementById('cm-status').value='active';
  }
  openModal('category-modal');
}
function editCategory(id){openCategoryModal(id);}
async function saveCategory(){
  const name=document.getElementById('cm-name').value.trim();
  if(!name){toast('Category name is required','error');return;}
  const id=document.getElementById('cm-id').value;
  const obj={id:id||uid(),name,emoji:document.getElementById('cm-emoji').value.trim()||'📦',desc:document.getElementById('cm-desc').value.trim(),status:document.getElementById('cm-status').value};
  if(id){const i=DB.categories.findIndex(x=>x.id===id);if(i>-1)DB.categories[i]=obj;}
  else DB.categories.push(obj);
  await saveDB();closeModal('category-modal');renderCategories();updateBadges();
  toast(id?'✓ Category updated!':'✓ Category added!','success');
}
function deleteCategory(id,name){
  if(DB.products.some(p=>p.cat===id)){toast('Cannot delete — products are using this category','error');return;}
  showConfirm('Delete Category',`Delete <strong>${esc(name)}</strong>?`,async()=>{
    DB.categories=DB.categories.filter(x=>x.id!==id);
    await saveDB();renderCategories();updateBadges();toast('Category deleted','info');
  });
}
