/* PetCARE — Page: userManagement */

/* ---------------- ADMIN: USER MANAGEMENT ---------------- */
function screenUsers(){
  const filter = UI.filters.userRole || "All";
  let rows = [...S.users];
  if(filter!=="All") rows = rows.filter(u=> filter==="Inactive" ? u.status==="Inactive" : u.role===({Resident:"owner","CVO Staff":"staff",Administrator:"admin"}[filter]));
  const roleFilters = ["All","Resident","CVO Staff","Administrator","Inactive"];
  return `
  <div class="page-head"><div><div class="crumb">Administration</div><h2>User Management</h2></div></div>
  <div class="card">
    <div class="filter-bar">${roleFilters.map(r=>`<button class="btn-sm ${filter===r?"solid":""}" data-setfilter="userRole:${r}">${r}</button>`).join("")}</div>
    <table><thead><tr><th>User ID</th><th>Name</th><th>Role</th><th>Barangay</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${rows.map(u=>`<tr><td>${u.id}</td><td><b>${esc(u.name)}</b></td><td><span class="badge-role">${roleDisplay(u.role)}</span></td><td>${esc(u.barangay||"—")}</td><td>${statusPill(u.status)}</td>
      <td><button class="btn-sm" data-viewuser="${u.id}">View</button>
      ${u.status==="Active" ? `<button class="btn-sm danger" data-toggleuser="${u.id}">Deactivate</button>` : u.status==="Inactive" ? `<button class="btn-sm solid" data-toggleuser="${u.id}">Activate</button>` : ""}
      </td></tr>`).join("")}</tbody></table>
  </div>`;
}
function toggleUserStatus(userId){
  if(!AuthService.hasRole("admin")) return;   // admin-only action (guard in addition to the UI)
  const u = userById(userId);
  const admin = currentUser();
  if(u.status==="Active"){ u.status = "Inactive"; }
  else if(u.status==="Inactive"){ u.status = "Active"; }
  else { return; }
  addAudit(admin.name, "Update", "User Management", u.id, `User ${u.name} set to ${u.status}.`);
  saveState();
  showToast(`${u.name} is now ${u.status}.`);
  render();
}
function viewUserModal(userId){
  const u = userById(userId);
  openModal(`
  <div class="modal-box">
    <h3>${esc(u.name)}</h3>
    <div class="kv">
      <div><div class="k">Role</div><div class="v">${u.role}</div></div>
      <div><div class="k">Email</div><div class="v">${esc(u.email)}</div></div>
      <div><div class="k">Mobile</div><div class="v">${esc(u.mobile||"—")}</div></div>
      <div><div class="k">Barangay</div><div class="v">${esc(u.barangay||"—")}</div></div>
      <div><div class="k">Status</div><div class="v">${u.status}</div></div>
    </div>
    <div class="modal-actions"><button class="btn-line" style="flex:1;" id="m-cancel">Close</button></div>
  </div>`);
}
