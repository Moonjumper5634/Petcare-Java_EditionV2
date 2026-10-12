/* PetCARE — Authenticated application shell (topbar, sidebar, content) */

/* ---------------- APP SHELL ---------------- */
function renderApp(){
  const u = currentUser();
  if(!u) return renderAuth();
  const nav = navs[u.role];
  const navHtml = nav.map(item=>{
    if(item.group) return `<div class="nav-section">${item.group}</div>`;
    const active = item.id === UI.screen ? "active" : "";
    const badge = item.id==="notifications" ? unreadCount(u.id) : 0;
    return `<div class="nav-item ${active}" data-nav="${item.id}">${navIcon(item.id)}${item.label}${badge?` <span style="margin-left:auto;background:#fff;color:var(--red);border-radius:999px;font-size:0.62rem;font-weight:800;padding:1px 6px;">${badge}</span>`:""}</div>`;
  }).join("");
  const renderer = screenMap[UI.screen] || screenMap.dashboard;
  const content = renderer();
  const roleTag = u.role==="owner" ? (u.barangay? `Resident — ${u.barangay}` : "Resident") : (u.tag || roleDisplay(u.role));
  return `
  <div class="app-shell">
    <div class="topbar">
      <div style="display:flex;align-items:center;gap:12px;">${sealSvg(38)}<div><div class="sysname">PetCARE</div><div class="orgname">City Veterinary Office — Santa Rosa, Laguna</div></div></div>
      <div class="user"><div class="avatar">${esc(u.initials||initials(u.name))}</div><div>${esc(u.name)}<br><span style="opacity:0.8;font-size:0.68rem;">${esc(roleTag)}</span></div><div class="logout" id="btn-logout">Logout</div></div>
    </div>
    <div class="sidebar">${navHtml}</div>
    <div class="main">${content}</div>
  </div>`;
}
