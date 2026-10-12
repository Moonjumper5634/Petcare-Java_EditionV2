/* PetCARE — Page: auditLogs */

/* ---------------- ADMIN: AUDIT LOGS ---------------- */
function screenAuditLogs(){
  const rows = S.audit;
  return `
  <div class="page-head"><div><div class="crumb">Administration</div><h2>Audit Logs</h2></div></div>
  <div class="card">
    ${rows.length ? `<table><thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Module</th><th>Reference ID</th><th>Description</th></tr></thead>
    <tbody>${rows.map(a=>`<tr><td>${fmtDateTime(a.datetime)}</td><td>${esc(a.user)}</td><td>${pill("gray:"+a.action)}</td><td>${esc(a.module)}</td><td>${esc(a.refId)}</td><td>${esc(a.description)}</td></tr>`).join("")}</tbody></table>`
    : emptyState(icoSvg('folder'),"No Activity Yet","Actions performed in the system will appear here.","")}
  </div>`;
}
