/* PetCARE — Page: servicesRecords */

/* ---------------- SERVICES & RECORDS ---------------- */
function screenServicesRecords(){
  const approved = S.requests.filter(r=>r.staffDecision==="Approved" && !r.serviceRecord);
  const completed = S.requests.filter(r=>r.status==="Completed").sort((a,b)=>b.serviceRecord.date.localeCompare(a.serviceRecord.date)).slice(0,8);
  const active = UI.selected.reqId && approved.find(r=>r.id===UI.selected.reqId) ? UI.selected.reqId : (approved[0] ? approved[0].id : null);

  const scanCard = `
  <div class="card">
    <h3>Returning Resident? Scan Pet QR</h3>
    <p style="font-size:0.78rem;color:var(--body);margin-top:-8px;">Scan the pet's Digital Pet ID to pull up their record instantly — no more relying on a physical booklet. This starts a ready-to-complete visit below.</p>
    <button class="btn-red" id="scan-qr-btn">Scan Pet QR</button>
  </div>`;

  if(!approved.length){
    return `
    <div class="page-head"><div><div class="crumb">Services</div><h2>Services &amp; Records</h2></div></div>
    ${scanCard}
    ${emptyState(icoSvg('vet'),"No Approved Requests Awaiting Service","Approved requests will appear here for service recording.","")}
    <div class="card"><h3>Recently Completed</h3>
      ${completed.length ? completed.map(r=>`<div class="checklist-row"><span>${r.id} — ${petById(r.petId)?.name||"—"} — ${esc(r.service)}</span>${statusPill("Completed")}</div>`).join("") : `<p class="empty">No completed service records yet.</p>`}
    </div>`;
  }

  const req = reqById(active);
  const pet = petById(req.petId), owner = userById(req.ownerId);
  const conditional = req.service === "Anti-Rabies Vaccination" ? `
    <div class="two-field">
      ${field("Vaccine Type", `<input id="svr-vaccine" placeholder="e.g. Rabisin">`)}
      ${field("Batch / Lot Number", `<input id="svr-batch" placeholder="e.g. AR-2026-0417">`)}
    </div>
    ${field("Next Due Date", `<input id="svr-nextdue" type="date">`)}`
  : req.service === "Microchipping" ? `
    ${field("Microchip Number", `<input id="svr-chip" placeholder="e.g. 900182820012345">`)}`
  : `
    ${field("Procedure Date", `<input id="svr-procdate" type="date" value="${todayISO()}">`)}
    ${field("Post-Procedure Remarks", `<textarea id="svr-postremarks" rows="2"></textarea>`)}`;

  return `
  <div class="page-head"><div><div class="crumb">Services</div><h2>Services &amp; Records</h2></div></div>
  ${scanCard}
  <div class="card">
    <div class="filter-bar">
      <select id="svr-select-req" style="flex:1;">
        ${approved.map(r=>`<option value="${r.id}" ${r.id===active?"selected":""}>${r.id} — ${petById(r.petId)?.name} — ${r.service}</option>`).join("")}
      </select>
    </div>
    <div class="role-banner">Selected Pet: <b>${esc(pet.name)} (${pet.id})</b> &nbsp;•&nbsp; Owner: <b>${esc(owner.name)}</b> &nbsp;•&nbsp; Service: <b>${esc(req.service)}</b></div>
    <h3>Service Information</h3>
    <div class="kv" style="margin-bottom:14px;">
      <div><div class="k">Request ID</div><div class="v">${req.id}</div></div>
      <div><div class="k">Pet</div><div class="v">${esc(pet.name)}</div></div>
      <div><div class="k">Owner</div><div class="v">${esc(owner.name)}</div></div>
      <div><div class="k">Service</div><div class="v">${esc(req.service)}</div></div>
    </div>
    <h3>Service Details</h3>
    <div class="two-field">
      ${field("Service Date *", `<input id="svr-date" type="date" value="${todayISO()}">`)}
      ${field("Staff / Veterinarian *", `<input id="svr-staff" value="${esc(currentUser().name)}${currentUser().role==='staff'?', DVM':''}">`)}
    </div>
    ${conditional}
    ${field("Remarks", `<textarea id="svr-remarks" rows="2"></textarea>`)}
    <div style="display:flex;gap:10px;margin-top:10px;">
      <button class="btn-red" style="flex:1;" id="svr-save">Save Service Record</button>
      <button class="btn-line" style="flex:1;" id="svr-cancel">Cancel</button>
    </div>
  </div>
  <div class="card"><h3>Recently Completed</h3>
    ${completed.length ? completed.map(r=>`<div class="checklist-row"><span>${r.id} — ${petById(r.petId)?.name||"—"} — ${esc(r.service)}</span>${statusPill("Completed")}</div>`).join("") : `<p class="empty">No completed service records yet.</p>`}
  </div>`;
}

function saveServiceRecord(reqId, data){
  const req = reqById(reqId), pet = petById(req.petId), staff = currentUser();
  req.serviceRecord = {date:data.date||todayISO(), staff:data.staff||staff.name, remarks:data.remarks||"",
    vaccineType:data.vaccine, batchNumber:data.batch, nextDue:data.nextdue, microchip:data.chip,
    procedureDate:data.procdate, postRemarks:data.postremarks};
  req.status = "Completed";
  if(req.service === "Anti-Rabies Vaccination"){ pet.lastRabies = req.serviceRecord.date; pet.rabiesStatus = "Updated"; }
  if(req.service === "Microchipping" && data.chip){ pet.microchip = data.chip; pet.microchipStatus = "Microchipped"; }
  if(req.service === "Kapon / Spay-Neuter"){ pet.kaponStatus = "Completed"; pet.kaponDate = req.serviceRecord.procedureDate || req.serviceRecord.date; }
  addNotification(req.ownerId, "Service completed.", `${req.service} for ${pet.name} has been completed and recorded by CVO staff.`);
  addAudit(staff.name, "Create", "Service Record", req.id, `${req.service} recorded for ${pet.name}.`);
  saveState();
  showToast(`Service record saved. ${req.id} marked Completed.`);
  UI.selected.reqId = null;
  UI.screen = "servicesrecords";
  render();
}
