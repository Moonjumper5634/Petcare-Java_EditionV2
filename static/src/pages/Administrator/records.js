/* PetCARE — Page: records */

/* ---------------- ADMIN: PET RECORDS / SERVICE MANAGEMENT ---------------- */
function screenPetRecordsAdmin(){
  const rows = S.pets;
  return `
  <div class="page-head"><div><div class="crumb">Administration</div><h2>Pet Records</h2></div></div>
  <div class="card">
    <table><thead><tr><th>Pet ID</th><th>Name</th><th>Species</th><th>Breed</th><th>Owner</th><th>Barangay</th><th>Registration</th><th>Last Rabies Vax</th><th>Action</th></tr></thead>
    <tbody>${rows.map(p=>{const o=userById(p.ownerId);return `<tr><td>${p.id}</td><td><b>${esc(p.name)}</b></td><td>${esc(p.species)}</td><td>${esc(p.breed)}</td><td>${o?esc(o.name):"—"}</td><td>${esc(p.barangay)}</td><td>${statusPill(p.registrationStatus)}</td><td>${p.lastRabies?fmtDate(p.lastRabies):"No Record"}</td>
      <td><button class="btn-sm" data-nav="petprofile" data-pet="${p.id}">View</button></td></tr>`;}).join("")}</tbody></table>
  </div>`;
}
function screenServiceManagement(){
  const rows = [...S.requests].sort((a,b)=>b.submittedDate.localeCompare(a.submittedDate));
  return `
  <div class="page-head"><div><div class="crumb">Administration</div><h2>Service Management</h2></div></div>
  <div class="card">
    <table><thead><tr><th>Request ID</th><th>Pet</th><th>Owner</th><th>Service</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${rows.map(r=>{const p=petById(r.petId), o=userById(r.ownerId);return `<tr><td>${r.id}</td><td>${p?esc(p.name):"—"}</td><td>${o?esc(o.name):"—"}</td><td>${esc(r.service)}</td><td>${fmtDate(r.submittedDate)}</td><td>${statusPill(requestDisplayStatus(r))}</td>
      <td><button class="btn-sm" data-nav="reqdetail" data-req="${r.id}">View</button></td></tr>`;}).join("")}</tbody></table>
  </div>`;
}
