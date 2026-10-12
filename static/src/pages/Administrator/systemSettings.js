/* PetCARE — Page: systemSettings */

/* ---------------- ADMIN: SYSTEM SETTINGS ---------------- */
function screenSystemSettings(){
  return `
  <div class="page-head"><div><div class="crumb">Administration</div><h2>System Settings</h2></div></div>
  <div class="card" style="max-width:640px;">
    <h3>Organization Details</h3>
    <div class="field"><label>Office Name</label><input value="City Veterinary Office — Santa Rosa, Laguna"></div>
    <div class="field"><label>Contact Email</label><input value="cvo@santarosalaguna.gov.ph"></div>
    <div class="field"><label>Contact Number</label><input value="(049) 123 4567"></div>
    <button class="btn-red" id="settings-save">Save Changes</button>
  </div>
  <div class="card" style="max-width:640px;">
    <h3>Notification Settings</h3>
    <div class="checklist-row"><span>Send status update notifications to residents</span>${pill("green:Enabled")}</div>
    <div class="checklist-row"><span>Send vaccination due-date reminders</span>${pill("green:Enabled")}</div>
    <div class="checklist-row"><span>Send monthly summary report to admins</span>${pill("gray:Disabled")}</div>
  </div>
  <div class="card" style="max-width:640px;">
    <h3>Local Development Data</h3>
    <p style="font-size:0.82rem;color:var(--body);">Reset all locally stored mock data back to its original seeded state. This clears every registration, request, adoption, notification, and audit entry created during this session.</p>
    <button class="btn-line" id="settings-reset">Reset Local Data</button>
  </div>`;
}
