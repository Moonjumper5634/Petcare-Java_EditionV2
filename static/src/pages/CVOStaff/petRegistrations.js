/* PetCARE — Page: petRegistrations */

/* ---------------- STAFF: PET REGISTRATIONS QUEUE + REVIEW ---------------- */
function screenPetRegistrations(){
  const filter = UI.filters.regStatus || "All";
  let rows = [...S.registrations].sort((a,b)=>b.submittedDate.localeCompare(a.submittedDate));
  if(filter!=="All") rows = rows.filter(r=>r.status===filter);
  return `
  <div class="page-head"><div><div class="crumb">Registrations & Requests</div><h2>Pet Registrations</h2></div></div>
  <div class="card">
    <div class="filter-bar">
      ${["All","Pending","Verified","Rejected"].map(s=>`<button class="btn-sm ${filter===s?"solid":""}" data-setfilter="regStatus:${s}">${s}</button>`).join("")}
    </div>
    ${rows.length ? `<table><thead><tr><th>Registration ID</th><th>Pet</th><th>Owner</th><th>Barangay</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${rows.map(r=>{const p=petById(r.petId), o=userById(r.ownerId);
      return `<tr><td>${r.id}</td><td><b>${p?esc(p.name):"—"}</b></td><td>${o?esc(o.name):"—"}</td><td>${p?esc(p.barangay):"—"}</td><td>${fmtDate(r.submittedDate)}</td><td>${statusPill(r.status)}</td>
      <td><button class="btn-sm solid" data-nav="regdetail" data-reg="${r.id}">Review</button></td></tr>`;}).join("")}</tbody></table>`
    : emptyState(icoSvg('doc'),"No Registrations","No pet registrations match this filter.","")}
  </div>`;
}

function screenRegDetail(){
  const reg = regById(UI.selected.regId);
  if(!reg) return emptyState(icoSvg('doc'),"No Registration Selected","Choose a registration to review.","");
  const p = petById(reg.petId), o = userById(reg.ownerId);
  const staffMode = currentUser().role !== "owner";
  return `
  <div class="page-head"><div><div class="crumb">Pet Registrations</div><h2>Registration ${reg.id}</h2></div></div>
  <div class="two-col">
    <div class="col-stack">
      <div class="card"><h3>Registration Details</h3>
        <div class="kv">
          <div><div class="k">Registration ID</div><div class="v">${reg.id}</div></div>
          <div><div class="k">Date Submitted</div><div class="v">${fmtDate(reg.submittedDate)}</div></div>
          <div><div class="k">Status</div><div class="v">${statusPill(reg.status)}</div></div>
          <div><div class="k">Source</div><div class="v">${reg.source}</div></div>
        </div>
      </div>
      <div class="card"><h3>Owner Details</h3>
        <div class="kv">
          <div><div class="k">Name</div><div class="v">${o?esc(o.name):"—"}</div></div>
          <div><div class="k">Contact</div><div class="v">${o?esc(o.mobile):"—"}</div></div>
          <div><div class="k">Barangay</div><div class="v">${o?esc(o.barangay):"—"}</div></div>
        </div>
      </div>
      <div class="card"><h3>Pet Details</h3>
        <div class="kv">
          <div><div class="k">Pet Name</div><div class="v">${p?esc(p.name):"—"}</div></div>
          <div><div class="k">Species</div><div class="v">${p?esc(p.species):"—"}</div></div>
          <div><div class="k">Breed</div><div class="v">${p?esc(p.breed):"—"}</div></div>
          <div><div class="k">Sex</div><div class="v">${p?esc(p.sex):"—"}</div></div>
          <div><div class="k">Age</div><div class="v">${p?ageString(p.dob):"—"}</div></div>
          <div><div class="k">Barangay</div><div class="v">${p?esc(p.barangay):"—"}</div></div>
        </div>
      </div>
      ${staffMode && reg.status==="Pending" ? `
      <div class="card"><h3>Verification Checklist</h3>
        <div class="checklist-row"><span>Required information complete</span>${pill("green:Checked")}</div>
        <div class="checklist-row"><span>Owner information available</span>${pill("green:Checked")}</div>
        <div class="checklist-row"><span>Pet information complete</span>${pill("green:Checked")}</div>
      </div>` : ""}
    </div>
    <div class="col-stack">
      <div class="card"><h3>Registration Timeline</h3>${renderTimeline(registrationTimelineSteps(reg))}</div>
      ${staffMode && reg.status==="Pending" ? `
      <div class="card">
        <h3>Staff Remarks</h3>
        <div class="field"><textarea id="reg-remarks" rows="3" placeholder="Optional remarks..."></textarea></div>
        <div style="display:flex;gap:10px;">
          <button class="btn-red" style="flex:1;" id="reg-approve-btn">Approve Registration</button>
          <button class="btn-sm danger" style="flex:1;padding:10px;" id="reg-reject-btn">Reject Registration</button>
        </div>
      </div>` : reg.status==="Rejected" ? `<div class="card"><h3>Rejection Reason</h3><p style="font-size:0.85rem;">${esc(reg.rejectionReason||"—")}</p></div>` : ""}
    </div>
  </div>`;
}

function approveRegistration(regId){
  const reg = regById(regId);
  const pet = petById(reg.petId);
  const owner = userById(reg.ownerId);
  const staff = currentUser();
  openModal(`
  <div class="modal-box">
    <h3>Approve registration for ${esc(pet.name)}?</h3>
    <div class="modal-kv kv">
      <div><div class="k">Registration</div><div class="v">${reg.id}</div></div>
      <div><div class="k">Owner</div><div class="v">${esc(owner.name)}</div></div>
    </div>
    <div class="modal-actions">
      <button class="btn-line" id="m-cancel">Cancel</button>
      <button class="btn-red" id="m-confirm-approve-reg">Confirm Approval</button>
    </div>
  </div>`);
  UI._pendingRegId = regId;
}
function confirmApproveRegistration(){
  const reg = regById(UI._pendingRegId);
  const pet = petById(reg.petId);
  const staff = currentUser();
  reg.status = "Verified";
  pet.registrationStatus = "Verified";
  pet.registeredDate = todayISO();
  addNotification(reg.ownerId, "Pet registration approved.", `${pet.name}'s registration has been approved. ${pet.name} is now a verified pet and eligible for veterinary services.`);
  addAudit(staff.name, "Approve", "Pet Registration", reg.id, `Registration for ${pet.name} approved.`);
  saveState();
  closeModal();
  showToast(`${pet.name}'s registration has been approved.`);
}
function rejectRegistration(regId){
  const reg = regById(regId);
  const pet = petById(reg.petId);
  openModal(`
  <div class="modal-box">
    <h3>Reject Pet Registration?</h3>
    ${field("Reason for Rejection *", `<textarea id="reg-reject-reason" rows="3"></textarea>`)}
    <div class="modal-actions">
      <button class="btn-line" id="m-cancel">Cancel</button>
      <button class="btn-sm danger" style="flex:1;padding:10px;" id="m-confirm-reject-reg">Confirm Rejection</button>
    </div>
  </div>`);
  UI._pendingRegId = regId;
}
function confirmRejectRegistration(reason){
  if(!reason || !reason.trim()){ showToast("Please enter a reason for rejection."); return; }
  const reg = regById(UI._pendingRegId);
  const pet = petById(reg.petId);
  const staff = currentUser();
  reg.status = "Rejected";
  reg.rejectionReason = reason.trim();
  pet.registrationStatus = "Rejected";
  addNotification(reg.ownerId, "Pet registration rejected.", `${pet.name}'s registration was rejected. Reason: ${reason.trim()}`);
  addAudit(staff.name, "Reject", "Pet Registration", reg.id, `Registration for ${pet.name} rejected — ${reason.trim()}`);
  saveState();
  closeModal();
  showToast(`${pet.name}'s registration has been rejected.`);
}
