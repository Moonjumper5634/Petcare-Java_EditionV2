/* PetCARE — DOM event wiring for all screens */

function attachEvents(root){
  /* ---- digital pet ID QR (renders after DOM insert since it needs a live container) ---- */
  root.querySelectorAll('[id^="pet-qr-"]').forEach(el=>{
    const petId = el.id.replace("pet-qr-", "");
    const pet = petById(petId);
    if(pet) renderPetQrInto(el.id, pet);
  });

  /* ---- generic nav ---- */
  root.querySelectorAll("[data-nav]").forEach(el=>{
    el.addEventListener("click", ()=>{
      const screen = el.dataset.nav;
      if(el.dataset.pet) UI.selected.petId = el.dataset.pet;
      if(el.dataset.reg) UI.selected.regId = el.dataset.reg;
      if(el.dataset.req) UI.selected.reqId = el.dataset.req;
      if(el.dataset.adopt) UI.selected.adoptId = el.dataset.adopt;
      if(el.dataset.shelter) UI.selected.shelterId = el.dataset.shelter;
      if(el.dataset.openreq) UI.selected.reqId = el.dataset.openreq;
      if(el.dataset.openreg) UI.selected.regId = el.dataset.openreg;
      // reset wizard state when freshly entering a wizard-driven screen from nav (not via internal wizard buttons)
      if(["petregistration","requestservice","adoptapply","walkin"].includes(screen) && UI.screen !== screen){
        resetWizardsForScreen(screen);
      }
      UI.screen = screen;
      render();
    });
  });

  /* ---- logout ---- */
  const logoutBtn = root.querySelector("#btn-logout");
  if(logoutBtn) logoutBtn.addEventListener("click", doLogout);

  /* ---- login ---- */
  const doLoginBtn = root.querySelector("#btn-do-login");
  if(doLoginBtn) doLoginBtn.addEventListener("click", ()=>{
    doLogin(document.getElementById("li-email").value, document.getElementById("li-password").value);
  });
  const goSignup = root.querySelector("#go-signup"); if(goSignup) goSignup.addEventListener("click", startSignup);
  const goForgot = root.querySelector("#go-forgot"); if(goForgot) goForgot.addEventListener("click", startForgot);
  root.querySelectorAll("#go-login").forEach(el=>el.addEventListener("click", ()=>{ UI.authScreen="login"; UI.errors={}; render(); }));
  const goLoginAfterVerify = root.querySelector("#go-login-after-verify"); if(goLoginAfterVerify) goLoginAfterVerify.addEventListener("click", ()=>{ UI.authScreen="login"; render(); });

  /* ---- signup ---- */
  const suSubmit = root.querySelector("#su-submit");
  if(suSubmit) suSubmit.addEventListener("click", ()=>{
    const data = {
      firstName: document.getElementById("su-first").value.trim(),
      middleName: document.getElementById("su-middle").value.trim(),
      lastName: document.getElementById("su-last").value.trim(),
      email: document.getElementById("su-email").value.trim(),
      mobile: document.getElementById("su-mobile").value.trim(),
      houseStreet: document.getElementById("su-house").value.trim(),
      barangay: document.getElementById("su-brgy").value,
      city: document.getElementById("su-city").value.trim(),
      province: document.getElementById("su-province").value.trim(),
      password: document.getElementById("su-pw").value,
      confirm: document.getElementById("su-confirm").value,
      agree: document.getElementById("su-agree").checked,
    };
    submitSignup(data);
  });
  const suCancel = root.querySelector("#su-cancel");
  if(suCancel) suCancel.addEventListener("click", ()=>{ UI.authScreen="login"; UI.errors={}; render(); });

  const goVerify = root.querySelector("#go-verify"); if(goVerify) goVerify.addEventListener("click", goToVerify);
  const doVerify = root.querySelector("#btn-do-verify");
  if(doVerify) doVerify.addEventListener("click", ()=> submitVerify(document.getElementById("vf-code").value.trim()));

  /* ---- forgot password ---- */
  const fgSend = root.querySelector("#btn-fg-send"); if(fgSend) fgSend.addEventListener("click", ()=>forgotSendCode(document.getElementById("fg-email").value));
  const fgVerify = root.querySelector("#btn-fg-verify"); if(fgVerify) fgVerify.addEventListener("click", ()=>forgotVerifyCode(document.getElementById("fg-code").value.trim()));
  const fgSetPw = root.querySelector("#btn-fg-setpw"); if(fgSetPw) fgSetPw.addEventListener("click", ()=>forgotSetPassword(document.getElementById("fg-pw").value, document.getElementById("fg-confirm").value));

  /* ---- filters ---- */
  root.querySelectorAll("[data-setfilter]").forEach(el=>{
    el.addEventListener("click", ()=>{
      const [key,val] = el.dataset.setfilter.split(":");
      UI.filters[key] = val;
      render();
    });
  });

  /* ---- notifications mark read ---- */
  root.querySelectorAll("[data-marknotif]").forEach(el=>{
    el.addEventListener("click", ()=>{
      const n = S.notifications.find(x=>x.id===el.dataset.marknotif);
      if(n && !n.read){ n.read = true; saveState(); render(); }
    });
  });

  /* =====================================================================
     PET REGISTRATION WIZARD
     ===================================================================== */
  const regContinue = root.querySelector("#reg-continue");
  if(regContinue) regContinue.addEventListener("click", ()=>{
    readWizardStep1Reg();
    const errs = validateRegStep1(UI.wiz.reg.data);
    if(Object.keys(errs).length){ UI.errors = errs; render(); return; }
    UI.errors = {};
    UI.wiz.reg.step = 2;
    render();
  });
  const regCancel = root.querySelector("#reg-cancel");
  if(regCancel) regCancel.addEventListener("click", ()=>{
    confirmCancel(()=>{ UI.wiz.reg = null; UI.screen = "mypets"; render(); });
  });
  const regBackH = root.querySelector("#reg-back-h");
  if(regBackH) regBackH.addEventListener("click", ()=>{ UI.wiz.reg.step = 1; render(); });
  const regContinueH = root.querySelector("#reg-continue-h");
  if(regContinueH) regContinueH.addEventListener("click", ()=>{
    readWizardStep2Reg();
    const errs = validateRegStep2(UI.wiz.reg.data);
    if(Object.keys(errs).length){ UI.errors = errs; render(); return; }
    UI.errors = {};
    UI.wiz.reg.step = 3;
    render();
  });
  const regBack = root.querySelector("#reg-back");
  if(regBack) regBack.addEventListener("click", ()=>{ UI.wiz.reg.step = 2; render(); });
  const regSubmit = root.querySelector("#reg-submit");
  if(regSubmit) regSubmit.addEventListener("click", ()=>{
    const w = UI.wiz.reg, d = w.data;
    const isWalkin = UI.screen === "walkin";
    const ownerId = isWalkin ? UI.wiz.walkin.residentId : currentUser().id;
    const petId = nextId("pet");
    const pet = {id:petId, name:d.name, species:d.species, breed:d.breed, sex:d.sex, dob:d.dob, color:d.color,
      barangay:d.barangay, ownerId, registrationStatus:"Pending", registeredDate:null,
      registrationSource: isWalkin ? "Walk-in" : "Owner",
      weight:d.weight?parseFloat(d.weight):null,
      healthStatus:d.healthStatus, healthNotes:d.healthNotes,
      lastRabies:d.rabiesStatus==="Updated" ? (d.lastRabies||null) : null,
      dewormingStatus:d.dewormingStatus, lastDeworming:d.dewormingStatus==="Updated" ? (d.lastDeworming||null) : null,
      microchip: d.microchipStatus==="Microchipped" ? (d.microchipNumber||"—") : null,
      microchipStatus:d.microchipStatus,
      proofOfResidency:d.proofOfResidency,
      photo:null};
    S.pets.push(pet);
    const regId = nextId("reg");
    const reg = {id:regId, petId, ownerId, status:"Pending", submittedDate:todayISO(), source:pet.registrationSource, rejectionReason:null};
    S.registrations.push(reg);
    addNotification(ownerId, "Pet registration submitted.", `Your registration for ${pet.name} has been submitted and is pending CVO verification.`);
    addAudit(userById(ownerId).name, "Create", "Pet Registration", regId, `Pet registration submitted for ${pet.name}.`);
    saveState();
    w.step = 4;
    w.createdRegId = regId;
    render();
  });
  const walkinVerifyNow = root.querySelector("#walkin-verify-now");
  if(walkinVerifyNow) walkinVerifyNow.addEventListener("click", ()=>{
    const reg = regById(UI.wiz.reg.createdRegId);
    const pet = petById(reg.petId);
    const staff = currentUser();
    reg.status = "Verified";
    pet.registrationStatus = "Verified";
    pet.registeredDate = todayISO();
    addNotification(reg.ownerId, "Pet registration approved.", `${pet.name}'s registration has been verified by CVO staff on-site.`);
    addAudit(staff.name, "Approve", "Pet Registration", reg.id, `Walk-in registration for ${pet.name} verified on-site.`);
    saveState();
    UI.wiz.walkin.stage = "service";
    UI.wiz.svc = {step:1, data:newSvcDraft()};
    UI.screen = "walkin";
    render();
  });

  /* =====================================================================
     SERVICE REQUEST WIZARD
     ===================================================================== */
  const svcContinue = root.querySelector("#svc-continue");
  if(svcContinue) svcContinue.addEventListener("click", ()=>{
    readWizardStep1Svc();
    if(!UI.wiz.svc.data.petId){ showToast("Please select a pet."); return; }
    UI.wiz.svc.step = 2;
    render();
  });
  const svcPetSel = root.querySelector("#svc-pet");
  if(svcPetSel) svcPetSel.addEventListener("change", ()=>{ readWizardStep1Svc(); render(); });
  const svcServiceSel = root.querySelector("#svc-service");
  if(svcServiceSel) svcServiceSel.addEventListener("change", ()=>{ readWizardStep1Svc(); render(); });
  const svcCancel = root.querySelector("#svc-cancel");
  if(svcCancel) svcCancel.addEventListener("click", ()=>{
    confirmCancel(()=>{ UI.wiz.svc = null; UI.screen = "mypets"; render(); });
  });
  const svcBack = root.querySelector("#svc-back");
  if(svcBack) svcBack.addEventListener("click", ()=>{ UI.wiz.svc.step = 1; render(); });
  const svcSubmit = root.querySelector("#svc-submit");
  if(svcSubmit) svcSubmit.addEventListener("click", ()=>{
    const w = UI.wiz.svc, d = w.data;
    const isWalkin = UI.screen === "walkin";
    const ownerId = isWalkin ? UI.wiz.walkin.residentId : currentUser().id;
    const reqId = nextId("req");
    const req = {id:reqId, petId:d.petId, ownerId, service:d.service, remarks:d.remarks, submittedDate:todayISO(),
      source: isWalkin?"Walk-in":"Owner", eligibility:null, staffDecision:"Pending", decisionDate:null,
      rejectionReason:null, serviceRecord:null, status:"Submitted"};
    S.requests.push(req);
    const pet = petById(d.petId);
    addNotification(ownerId, "Service request submitted.", `Your ${d.service} request for ${pet.name} has been submitted.`);
    addAudit(userById(ownerId).name, "Create", "Service Request", reqId, `${d.service} request submitted for ${pet.name}.`);
    saveState();
    w.step = 3;
    w.createdReqId = reqId;
    render();
  });
  /* walk-in: staff moves to the pet-registration stage (stays on the walk-in screen) */
  root.querySelectorAll("[data-walkin-stage]").forEach(el=>el.addEventListener("click", ()=>{ UI.wiz.walkin.stage = el.dataset.walkinStage; render(); }));
  const walkinToElig = root.querySelector("#walkin-to-eligibility");
  if(walkinToElig) walkinToElig.addEventListener("click", ()=>{
    UI.selected.reqId = UI.wiz.svc.createdReqId;
    UI.wiz.walkin.stage = "eligibility";
    UI.screen = "walkin";
    render();
  });

  /* =====================================================================
     STAFF: PET REGISTRATION REVIEW
     ===================================================================== */
  const regApproveBtn = root.querySelector("#reg-approve-btn");
  if(regApproveBtn) regApproveBtn.addEventListener("click", ()=> approveRegistration(UI.selected.regId));
  const regRejectBtn = root.querySelector("#reg-reject-btn");
  if(regRejectBtn) regRejectBtn.addEventListener("click", ()=> rejectRegistration(UI.selected.regId));

  /* =====================================================================
     STAFF: REQUEST ELIGIBILITY / DECISION
     ===================================================================== */
  const runAssessBtn = root.querySelector("#run-assessment-btn");
  if(runAssessBtn) runAssessBtn.addEventListener("click", ()=>{
    runAssessment(UI.selected.reqId);
    if(UI.wiz.walkin && UI.screen==="walkin") render();
  });
  const reqApproveBtn = root.querySelector("#req-approve-btn");
  if(reqApproveBtn && !reqApproveBtn.disabled) reqApproveBtn.addEventListener("click", ()=> approveRequestModal(UI.selected.reqId));
  const reqRejectBtn = root.querySelector("#req-reject-btn");
  if(reqRejectBtn && !reqRejectBtn.disabled) reqRejectBtn.addEventListener("click", ()=> rejectRequestModal(UI.selected.reqId));
  const reqVerifyBtn = root.querySelector("#req-verify-btn");
  if(reqVerifyBtn) reqVerifyBtn.addEventListener("click", ()=> requestVerification(UI.selected.reqId));

  /* =====================================================================
     SERVICES & RECORDS
     ===================================================================== */
  const scanQrBtn = root.querySelector("#scan-qr-btn");
  if(scanQrBtn) scanQrBtn.addEventListener("click", ()=> openScanModal(pet=> promptQuickVisitService(pet)));
  const svrSelect = root.querySelector("#svr-select-req");
  if(svrSelect) svrSelect.addEventListener("change", ()=>{ UI.selected.reqId = svrSelect.value; render(); });
  const svrSave = root.querySelector("#svr-save");
  if(svrSave) svrSave.addEventListener("click", ()=>{
    const reqId = UI.selected.reqId || document.getElementById("svr-select-req").value;
    const data = {
      date: document.getElementById("svr-date").value || todayISO(),
      staff: document.getElementById("svr-staff").value,
      remarks: document.getElementById("svr-remarks") ? document.getElementById("svr-remarks").value : "",
    };
    const vaccineEl = document.getElementById("svr-vaccine");
    if(vaccineEl){ data.vaccine = vaccineEl.value; data.batch = document.getElementById("svr-batch").value; data.nextdue = document.getElementById("svr-nextdue").value; }
    const chipEl = document.getElementById("svr-chip");
    if(chipEl){ data.chip = chipEl.value; }
    const procEl = document.getElementById("svr-procdate");
    if(procEl){ data.procdate = procEl.value; data.postremarks = document.getElementById("svr-postremarks").value; }
    saveServiceRecord(reqId, data);
    if(UI.wiz.walkin && UI.wiz.walkin.stage==="record"){
      UI.wiz.walkin.stage = "done";
      UI.screen = "walkin";
      render();
    }
  });
  const svrCancel = root.querySelector("#svr-cancel");
  if(svrCancel) svrCancel.addEventListener("click", ()=>{
    confirmCancel(()=>{ UI.screen = "dashboard"; render(); });
  });

  /* =====================================================================
     WALK-IN FLOW
     ===================================================================== */
  const wiHasAccount = root.querySelector("#wi-has-account");
  if(wiHasAccount) wiHasAccount.addEventListener("click", ()=>{ UI.wiz.walkin.stage="search"; render(); });
  const wiNoAccount = root.querySelector("#wi-no-account");
  if(wiNoAccount) wiNoAccount.addEventListener("click", ()=>{ UI.wiz.walkin.stage="create"; render(); });
  const wiBackStart = root.querySelector("#wi-back-start");
  if(wiBackStart) wiBackStart.addEventListener("click", ()=>{ UI.wiz.walkin.stage="start"; render(); });
  const wiBackStart2 = root.querySelector("#wi-back-start2");
  if(wiBackStart2) wiBackStart2.addEventListener("click", ()=>{ UI.wiz.walkin.stage="start"; render(); });
  const wiSearchBtn = root.querySelector("#wi-search-btn");
  if(wiSearchBtn) wiSearchBtn.addEventListener("click", ()=>{ UI.wiz.walkin.searchQuery = document.getElementById("wi-search-input").value; render(); });
  root.querySelectorAll("[data-wiselect]").forEach(el=>{
    el.addEventListener("click", ()=>{ UI.wiz.walkin.residentId = el.dataset.wiselect; UI.wiz.walkin.stage="residentFound"; render(); });
  });
  const wiCreateAccount = root.querySelector("#wi-create-account");
  if(wiCreateAccount) wiCreateAccount.addEventListener("click", ()=>{
    const d = {
      name: document.getElementById("wi-c-name").value.trim(),
      mobile: document.getElementById("wi-c-mobile").value.trim(),
      email: document.getElementById("wi-c-email").value.trim() || `resident${nextId("user").replace("U-","")}@email.com`,
      address: document.getElementById("wi-c-address").value.trim(),
      barangay: document.getElementById("wi-c-barangay").value,
    };
    if(!d.name){ showToast("Please enter the resident's name."); return; }
    const id = nextId("user");
    const parts = d.name.split(" ");
    const user = {id, role:"owner", firstName:parts[0], lastName:parts.slice(1).join(" "), name:d.name,
      email:d.email, mobile:d.mobile, houseStreet:d.address, barangay:d.barangay, city:"Santa Rosa", province:"Laguna",
      passwordHash:DevCredentials.hash("changeme123"), mustChangePassword:true, status:"Active"};
    S.users.push(user);
    addAudit(currentUser().name, "Create", "User Management", id, `Resident account created for ${d.name} via Walk-in.`);
    saveState();
    UI.wiz.walkin.residentId = id;
    UI.wiz.walkin.stage = "created";
    render();
  });
  const wiContinueToPet = root.querySelector("#wi-continue-to-pet");
  if(wiContinueToPet) wiContinueToPet.addEventListener("click", ()=>{
    UI.wiz.walkin.stage = "pet";
    UI.wiz.reg = {step:1, data:newRegDraft()};
    render();
  });
  const wiStartNew = root.querySelector("#wi-start-new");
  if(wiStartNew) wiStartNew.addEventListener("click", ()=>{ UI.wiz.walkin = newWalkinState(); render(); });

  /* =====================================================================
     ADOPTION
     ===================================================================== */
  const adReview = root.querySelector("#ad-review");
  if(adReview) adReview.addEventListener("click", ()=>{
    const dr = UI.wiz.adopt.data;
    dr.applicantName = document.getElementById("ad-name").value.trim();
    dr.contact = document.getElementById("ad-contact").value.trim();
    dr.email = document.getElementById("ad-email").value.trim();
    dr.address = document.getElementById("ad-address").value.trim();
    dr.barangay = document.getElementById("ad-barangay").value;
    dr.reason = document.getElementById("ad-reason").value.trim();
    dr.experience = document.getElementById("ad-experience").value.trim();
    dr.housing = document.getElementById("ad-housing").value;
    dr.agree = document.getElementById("ad-agree").checked;
    const errs = {};
    if(!dr.applicantName) errs.adname = "Required field";
    if(!dr.contact) errs.adcontact = "Required field";
    if(!dr.email) errs.ademail = "Invalid email";
    if(!dr.address) errs.adaddress = "Required field";
    if(!dr.reason) errs.adreason = "Required field";
    if(!dr.agree) errs.adagree = "Required field";
    if(Object.keys(errs).length){ UI.errors = errs; render(); return; }
    UI.errors = {};
    UI.wiz.adopt.step = 2;
    render();
  });
  const adBackEdit = root.querySelector("#ad-back-edit");
  if(adBackEdit) adBackEdit.addEventListener("click", ()=>{ UI.wiz.adopt.step = 1; render(); });
  const adCancel = root.querySelector("#ad-cancel");
  if(adCancel) adCancel.addEventListener("click", ()=>{
    confirmCancel(()=>{ UI.wiz.adopt = null; UI.screen = "adopt"; render(); });
  });
  const adSubmit = root.querySelector("#ad-submit");
  if(adSubmit) adSubmit.addEventListener("click", ()=>{
    const dr = UI.wiz.adopt.data;
    const shelterPet = shelterById(UI.selected.shelterId);
    const adoptId = nextId("adopt");
    const adoption = {id:adoptId, shelterPetId:shelterPet.id, applicantOwnerId: currentUser().id,
      applicantName:dr.applicantName, contact:dr.contact, email:dr.email, address:dr.address, barangay:dr.barangay,
      reason:dr.reason, experience:dr.experience, housing:dr.housing, status:"Interview Required", interview:null,
      submittedDate:todayISO(), rejectionReason:null};
    S.adoptions.push(adoption);
    shelterPet.status = "Application Pending";
    addNotification(currentUser().id, "Adoption application submitted.", `Your adoption application for ${shelterPet.name} has been submitted for review.`);
    addAudit(currentUser().name, "Create", "Adoption", adoptId, `Adoption application submitted for ${shelterPet.name}.`);
    saveState();
    UI._lastAdoptId = adoptId;
    UI.screen = "adoptsubmitted";
    render();
  });

  const interviewCompleteBtn = root.querySelector("#interview-complete-btn");
  if(interviewCompleteBtn) interviewCompleteBtn.addEventListener("click", ()=> completeInterview(UI.selected.adoptId));
  const adoptApproveBtn = root.querySelector("#adopt-approve-btn");
  if(adoptApproveBtn) adoptApproveBtn.addEventListener("click", ()=> approveAdoption(UI.selected.adoptId));
  const adoptRejectBtn = root.querySelector("#adopt-reject-btn");
  if(adoptRejectBtn) adoptRejectBtn.addEventListener("click", ()=> rejectAdoptionModal(UI.selected.adoptId));

  /* =====================================================================
     ADMIN: USERS / CRITERIA
     ===================================================================== */
  root.querySelectorAll("[data-viewuser]").forEach(el=>el.addEventListener("click", ()=>viewUserModal(el.dataset.viewuser)));
  root.querySelectorAll("[data-toggleuser]").forEach(el=>el.addEventListener("click", ()=>toggleUserStatus(el.dataset.toggleuser)));
  root.querySelectorAll("[data-editcriterion]").forEach(el=>el.addEventListener("click", ()=>{
    const [svc, idx] = el.dataset.editcriterion.split("|"); editCriterionModal(svc, parseInt(idx));
  }));
  root.querySelectorAll("[data-togglecriterion]").forEach(el=>el.addEventListener("click", ()=>{
    const [svc, idx] = el.dataset.togglecriterion.split("|"); toggleCriterion(svc, parseInt(idx));
  }));

  /* ---- reports ---- */
  const rpGenerate = root.querySelector("#rp-generate");
  if(rpGenerate) rpGenerate.addEventListener("click", ()=>{
    UI.filters.report = {
      from: document.getElementById("rp-from").value, to: document.getElementById("rp-to").value,
      barangay: document.getElementById("rp-barangay").value, service: document.getElementById("rp-service").value,
      status: document.getElementById("rp-status").value,
    };
    render();
  });
  const rpClear = root.querySelector("#rp-clear");
  if(rpClear) rpClear.addEventListener("click", ()=>{ UI.filters.report = null; render(); });

  /* ---- settings ---- */
  const settingsSave = root.querySelector("#settings-save");
  if(settingsSave) settingsSave.addEventListener("click", ()=> showToast("Settings saved."));
  const settingsReset = root.querySelector("#settings-reset");
  if(settingsReset) settingsReset.addEventListener("click", ()=>{
    if(confirm("Reset all locally stored mock data to its original seeded state? You will be signed out.")) resetLocalData();
  });
  const profileSavePw = root.querySelector("#profile-save-pw");
  if(profileSavePw) profileSavePw.addEventListener("click", saveProfilePassword);

  /* =====================================================================
     MODAL BUTTONS (generic + specific confirmations)
     ===================================================================== */
  const mCancel = root.querySelector("#m-cancel");
  if(mCancel) mCancel.addEventListener("click", ()=>{ if(mCancel.dataset.scancancel) stopScan(); closeModal(); });
  const mContinueEdit = root.querySelector("#m-continue-edit");
  if(mContinueEdit) mContinueEdit.addEventListener("click", closeModal);
  const mDiscard = root.querySelector("#m-discard");
  if(mDiscard) mDiscard.addEventListener("click", ()=>{ const fn = UI._discardFn; closeModal(); if(fn) fn(); });

  /* ---- QR scan modal ---- */
  if(root.querySelector("#scan-video") && !_scanStream && !_scanInterval){
    startCameraScan();
  }
  const scanManualBtn = root.querySelector("#scan-manual-btn");
  if(scanManualBtn) scanManualBtn.addEventListener("click", ()=>{
    const raw = document.getElementById("scan-manual").value.trim();
    if(!raw){ showToast("Enter a Pet ID or paste the scanned code."); return; }
    const petId = parsePetQrValue(raw) || raw.toUpperCase();
    if(!petId){ showToast("That code could not be verified."); return; }
    handleScannedPetId(petId);
  });
  root.querySelectorAll("[data-quickscan]").forEach(el=>{
    el.addEventListener("click", ()=> handleScannedPetId(el.dataset.quickscan));
  });
  root.querySelectorAll("[data-quickvisit]").forEach(el=>{
    el.addEventListener("click", ()=> startQuickVisit(el.dataset.quickvisit));
  });

  const mConfirmApproveReg = root.querySelector("#m-confirm-approve-reg");
  if(mConfirmApproveReg) mConfirmApproveReg.addEventListener("click", confirmApproveRegistration);
  const mConfirmRejectReg = root.querySelector("#m-confirm-reject-reg");
  if(mConfirmRejectReg) mConfirmRejectReg.addEventListener("click", ()=> confirmRejectRegistration(document.getElementById("reg-reject-reason").value));

  const mConfirmApproveReq = root.querySelector("#m-confirm-approve-req");
  if(mConfirmApproveReq) mConfirmApproveReq.addEventListener("click", confirmApproveRequest);
  const mConfirmRejectReq = root.querySelector("#m-confirm-reject-req");
  if(mConfirmRejectReq) mConfirmRejectReq.addEventListener("click", ()=> confirmRejectRequest(document.getElementById("req-reject-reason").value));

  const mConfirmRejectAdopt = root.querySelector("#m-confirm-reject-adopt");
  if(mConfirmRejectAdopt) mConfirmRejectAdopt.addEventListener("click", ()=> confirmRejectAdoption(document.getElementById("adopt-reject-reason").value));

  const mSaveCriterion = root.querySelector("#m-save-criterion");
  if(mSaveCriterion) mSaveCriterion.addEventListener("click", ()=>{
    saveCriterion(mSaveCriterion.dataset.svc, parseInt(mSaveCriterion.dataset.idx), document.getElementById("crit-desc").value);
  });

  /* close modal when clicking the overlay background */
  const overlay = root.querySelector("#modal-overlay");
  if(overlay) overlay.addEventListener("click", (e)=>{ if(e.target === overlay) closeModal(); });
}
