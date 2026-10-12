/* PetCARE — Page: reports */

/* ---------------- REPORTS ---------------- */
function screenReports(){
  const f = UI.filters.report || {from:"", to:"", barangay:"All", service:"All", status:"All"};
  UI.filters.report = f;
  function inRange(dateStr){
    if(f.from && dateStr < f.from) return false;
    if(f.to && dateStr > f.to) return false;
    return true;
  }
  const regsInRange = S.registrations.filter(r=>inRange(r.submittedDate));
  const reqsInRange = S.requests.filter(r=>inRange(r.submittedDate))
    .filter(r=> f.barangay==="All" || (petById(r.petId)&&petById(r.petId).barangay===f.barangay))
    .filter(r=> f.service==="All" || r.service===f.service)
    .filter(r=> f.status==="All" || requestDisplayStatus(r)===f.status);
  const adoptsInRange = S.adoptions.filter(a=>inRange(a.submittedDate));
  const byService = {};
  SERVICES.forEach(s=>byService[s]=reqsInRange.filter(r=>r.service===s).length);
  const assessed = reqsInRange.filter(r=>r.eligibility).length;
  const eligible = reqsInRange.filter(r=>r.eligibility && r.eligibility.eligible).length;

  return `
  <div class="page-head"><div><div class="crumb">Reporting</div><h2>Reports</h2></div></div>
  <div class="card">
    <div class="filter-bar">
      <input type="date" id="rp-from" value="${f.from}" title="Date From">
      <input type="date" id="rp-to" value="${f.to}" title="Date To">
      <select id="rp-barangay"><option ${f.barangay==="All"?"selected":""}>All</option>${BARANGAYS.map(b=>`<option ${f.barangay===b?"selected":""}>${b}</option>`).join("")}</select>
      <select id="rp-service"><option ${f.service==="All"?"selected":""}>All</option>${SERVICES.map(s=>`<option ${f.service===s?"selected":""}>${s}</option>`).join("")}</select>
      <select id="rp-status"><option ${f.status==="All"?"selected":""}>All</option>${["Submitted","For Review","Approved","Rejected","Completed"].map(s=>`<option ${f.status===s?"selected":""}>${s}</option>`).join("")}</select>
    </div>
    <div style="display:flex;gap:10px;"><button class="btn-red" id="rp-generate">Generate Report</button><button class="btn-line" id="rp-clear">Clear Filters</button></div>
  </div>
  <div class="grid3">
    <div class="report-card"><h4>Pet Registration</h4><p>${regsInRange.length} submissions in range</p><div class="num" style="font-size:1.4rem;font-weight:800;">${regsInRange.filter(r=>r.status==="Verified").length} Verified</div></div>
    <div class="report-card"><h4>Veterinary Services</h4><p>${reqsInRange.length} requests in range</p><div class="num" style="font-size:1.4rem;font-weight:800;">${reqsInRange.filter(r=>r.status==="Completed").length} Completed</div></div>
    <div class="report-card"><h4>Adoption</h4><p>${adoptsInRange.length} applications in range</p><div class="num" style="font-size:1.4rem;font-weight:800;">${adoptsInRange.filter(a=>a.status==="Approved").length} Approved</div></div>
    <div class="report-card"><h4>Anti-Rabies Vaccination</h4><p>Requests for this service</p><div class="num" style="font-size:1.4rem;font-weight:800;">${byService["Anti-Rabies Vaccination"]}</div></div>
    <div class="report-card"><h4>Microchipping</h4><p>Requests for this service</p><div class="num" style="font-size:1.4rem;font-weight:800;">${byService["Microchipping"]}</div></div>
    <div class="report-card"><h4>Kapon / Spay-Neuter</h4><p>Requests for this service</p><div class="num" style="font-size:1.4rem;font-weight:800;">${byService["Kapon / Spay-Neuter"]}</div></div>
    <div class="report-card"><h4>Eligibility Assessments</h4><p>${assessed} assessed in range</p><div class="num" style="font-size:1.4rem;font-weight:800;">${eligible} Eligible</div></div>
  </div>
  <div class="card"><h3>Matching Service Requests</h3>
    ${reqsInRange.length ? `<table><thead><tr><th>Request ID</th><th>Pet</th><th>Service</th><th>Barangay</th><th>Date</th><th>Status</th></tr></thead>
    <tbody>${reqsInRange.map(r=>{const p=petById(r.petId);return `<tr><td>${r.id}</td><td>${p?esc(p.name):"—"}</td><td>${esc(r.service)}</td><td>${p?esc(p.barangay):"—"}</td><td>${fmtDate(r.submittedDate)}</td><td>${statusPill(requestDisplayStatus(r))}</td></tr>`;}).join("")}</tbody></table>`
    : emptyState(icoSvg('chart'),"No Matching Records","Adjust the filters above and generate the report again.","")}
  </div>`;
}
