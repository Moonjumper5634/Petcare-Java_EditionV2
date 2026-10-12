/* PetCARE — Page: pets */

/* ---------------- MY PETS / PET PROFILE ---------------- */
function petCard(p){
  const owner = userById(p.ownerId);
  return `
  <div class="pet-card">
    <div class="pet-card-top">
      ${petAvatar(p,48)}
      <div>
        <div class="pet-card-name">${esc(p.name)}</div>
        <div class="pet-card-sub">${esc(p.species)} · ${esc(p.breed)} · ${esc(p.sex)} · ${ageString(p.dob)}</div>
      </div>
    </div>
    <div class="pet-card-status">
      <div class="checklist-row"><span>Registration Status</span>${statusPill(p.registrationStatus)}</div>
      <div class="checklist-row"><span>Barangay</span><b style="font-size:0.78rem;">${esc(p.barangay)}</b></div>
      <div class="checklist-row"><span>Last Anti-Rabies Vaccination</span><b style="font-size:0.78rem;">${p.lastRabies?fmtDate(p.lastRabies):"No Record"}</b></div>
    </div>
    <button class="btn-red pet-card-btn" data-nav="petprofile" data-pet="${p.id}">View Pet Profile</button>
  </div>`;
}
function screenMyPets(){
  const u = currentUser();
  const mine = ownerPets(u.id);
  return `
  <div class="page-head">
    <div><div class="crumb">Pet Records</div><h2>My Pets</h2></div>
    <button class="btn-red" data-nav="petregistration">+ Register a New Pet</button>
  </div>
  ${mine.length ? `<div class="pet-card-grid">${mine.map(petCard).join("")}</div>`
    : emptyState(icoSvg('paw'),"No Pets","You don't have any registered pets yet.",`<button class="btn-red" data-nav="petregistration">Register a Pet</button>`)}
  `;
}

function screenPetProfile(){
  const p = petById(UI.selected.petId) || ownerPets(currentUser().id)[0];
  if(!p) return emptyState(icoSvg('paw'),"No Pet Selected","Select a pet from My Pets to view its profile.","");
  const role = currentUser().role;
  const isOwner = role === "owner";
  const owner = userById(p.ownerId);
  const myReqs = S.requests.filter(r=>r.petId===p.id);
  const canRequest = isOwner && p.registrationStatus==="Verified";
  const actions = isOwner
    ? (canRequest ? `<button class="btn-red" data-nav="requestservice" data-pet="${p.id}">Request a Service</button>` : "")
    : `<button class="btn-red" data-nav="eligibility" data-req="${myReqs[0]?myReqs[0].id:''}">Assess Eligibility</button>`;

  const historyRows = myReqs.filter(r=>r.serviceRecord).sort((a,b)=>b.serviceRecord.date.localeCompare(a.serviceRecord.date));
  const vaxRows = historyRows.filter(r=>r.service==="Anti-Rabies Vaccination")
    .map(r=>`<tr><td>${fmtDate(r.serviceRecord.date)}</td><td>${esc(r.serviceRecord.vaccineType||"—")}</td><td>${statusPill("Completed")}</td></tr>`).join("");
  const kaponRows = historyRows.filter(r=>r.service==="Kapon / Spay-Neuter")
    .map(r=>`<tr><td>${fmtDate(r.serviceRecord.date)}</td><td>${esc(r.serviceRecord.staff||"—")}</td><td>${statusPill("Completed")}</td></tr>`).join("");

  return `
  <div class="page-head">
    <div><div class="crumb">Pet Records / ${esc(p.name)}</div><h2>${esc(p.name)}</h2></div>
    <div>${actions}</div>
  </div>
  <div class="two-col">
    <div class="col-stack">
      <div class="card" style="text-align:center;">
        <div style="width:120px;height:120px;border-radius:50%;overflow:hidden;margin:0 auto 14px;border:3px solid var(--border);box-shadow:0 4px 10px rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;background:var(--danger-bg);color:var(--red);font-weight:700;font-size:1.6rem;">
          ${p.photo?`<img src="${p.photo}" alt="${esc(p.name)}" style="width:100%;height:100%;object-fit:cover;">`:esc(initials(p.name))}
        </div>
        <h3 style="border-left:none;padding-left:0;margin-bottom:4px;">${esc(p.name)}</h3>
        <div style="font-size:0.78rem;color:var(--muted);margin-bottom:14px;">${esc(p.breed)} (${esc(p.species)})</div>
        ${statusPill(p.registrationStatus)}
      </div>
      <div class="card"><h3>Pet Information</h3>
        <div class="kv">
          <div><div class="k">Pet ID</div><div class="v">${p.id}</div></div>
          <div><div class="k">Species</div><div class="v">${esc(p.species)}</div></div>
          <div><div class="k">Breed</div><div class="v">${esc(p.breed)}</div></div>
          <div><div class="k">Sex</div><div class="v">${esc(p.sex)}</div></div>
          <div><div class="k">Age</div><div class="v">${ageString(p.dob)}</div></div>
          <div><div class="k">Barangay</div><div class="v">${esc(p.barangay)}</div></div>
          <div><div class="k">Registration Status</div><div class="v">${p.registrationStatus}</div></div>
        </div>
      </div>
      <div class="card"><h3>Owner</h3>
        <div class="kv">
          <div><div class="k">Owner Name</div><div class="v">${owner?esc(owner.name):"—"}</div></div>
          <div><div class="k">Contact Number</div><div class="v">${owner?esc(owner.mobile):"—"}</div></div>
        </div>
      </div>
      ${p.registrationStatus==="Verified" ? `
      <div class="card" style="text-align:center;">
        <h3 style="text-align:left;">Digital Pet ID</h3>
        <p style="font-size:0.72rem;color:var(--body);text-align:left;margin-top:-6px;">This replaces a physical booklet. Staff can scan this code on a return visit (e.g. next year's anti-rabies shot) to instantly pull up ${esc(p.name)}'s record and add the new visit — no paperwork to lose.</p>
        <div id="pet-qr-${p.id}" style="display:flex;align-items:center;justify-content:center;margin:10px auto;width:220px;height:220px;"></div>
        <p style="font-size:0.66rem;color:var(--muted);text-align:left;margin:6px 0 0;">Scanning this with any camera app (e.g. Google Lens) shows ${esc(p.name)}'s pet, owner, and vaccination snapshot directly. Scanning it inside PetCARE (Services &amp; Records → Scan Pet QR) opens the live, up-to-date record.</p>
        <div style="font-weight:800;font-size:0.9rem;letter-spacing:0.03em;">${p.id}</div>
      </div>` : ""}
    </div>
    <div class="col-stack">
      <div class="card"><h3>Microchipping</h3><p class="empty">${p.microchip ? "Microchip #"+esc(p.microchip) : "No records on file."}</p></div>
      <div class="card"><h3>Kapon / Spay-Neuter</h3>
        ${kaponRows ? `<table><thead><tr><th>Date</th><th>Staff</th><th>Status</th></tr></thead><tbody>${kaponRows}</tbody></table>` : `<p class="empty">No records on file.</p>`}
      </div>
      <div class="card"><h3>Anti-Rabies Vaccine</h3>
        ${vaxRows ? `<table><thead><tr><th>Date</th><th>Vaccine</th><th>Status</th></tr></thead><tbody>${vaxRows}</tbody></table>` : `<p class="empty">No veterinary service records yet.</p>`}
      </div>
      ${!isOwner ? `<div class="card"><h3>Service Requests</h3>
        ${myReqs.length ? myReqs.map(r=>`<div class="checklist-row"><span>${r.id} — ${esc(r.service)}</span>${statusPill(r.staffDecision==="Rejected"?"Rejected":r.status)}</div>`).join("") : `<p class="empty">No service requests on file.</p>`}
      </div>` : ""}
    </div>
  </div>`;
}
