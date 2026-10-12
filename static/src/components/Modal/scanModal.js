/* PetCARE — QR scan modal (camera, manual entry, quick lookup) and quick-visit flow */

/* ---------------- QR SCAN MODAL (staff) ---------------- */
let _scanStream = null, _scanInterval = null;
function stopScan(){
  if(_scanInterval){ clearInterval(_scanInterval); _scanInterval = null; }
  if(_scanStream){ _scanStream.getTracks().forEach(t=>t.stop()); _scanStream = null; }
}
function openScanModal(onResolvePet){
  UI._scanOnResolve = onResolvePet;
  openModal(`
  <div class="modal-box" style="max-width:420px;">
    <h3>Scan Pet QR</h3>
    <p style="font-size:0.76rem;color:var(--body);margin-top:-6px;">Point the camera at the pet's QR ID card. If camera access isn't available in this browser, use manual entry or quick lookup below.</p>
    <div id="scan-camera-wrap" style="background:#111;border-radius:8px;overflow:hidden;position:relative;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;">
      <video id="scan-video" style="width:100%;height:100%;object-fit:cover;" playsinline muted></video>
      <div id="scan-status" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:0.72rem;text-align:center;padding:16px;background:rgba(0,0,0,0.55);">Requesting camera access…</div>
    </div>
    <canvas id="scan-canvas" style="display:none;"></canvas>
    ${field("Or enter Pet ID / scanned code manually", `<input id="scan-manual" placeholder="e.g. P-1042 or PETCARE:P-1042:XXXXXX">`)}
    <button class="btn-line" style="width:100%;margin-bottom:10px;" id="scan-manual-btn">Look Up</button>
    <div style="font-size:0.68rem;color:var(--muted);margin-bottom:6px;">Quick lookup (no camera needed):</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
      <button class="btn-sm" data-quickscan="P-1042">Buddy</button>
      <button class="btn-sm" data-quickscan="P-1046">Max</button>
      <button class="btn-sm" data-quickscan="P-1047">Bruno</button>
    </div>
    <div class="modal-actions"><button class="btn-line" id="m-cancel" data-scancancel="1">Close</button></div>
  </div>`);
}
function handleScannedPetId(petId){
  const pet = petById(petId);
  stopScan();
  closeModal();
  if(!pet){ showToast(`No pet found for code "${petId}".`); return; }
  const cb = UI._scanOnResolve;
  UI._scanOnResolve = null;
  if(cb) cb(pet);
}
function startCameraScan(){
  const video = document.getElementById("scan-video");
  const canvas = document.getElementById("scan-canvas");
  const status = document.getElementById("scan-status");
  if(!video || !canvas) return;
  if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof jsQR === "undefined"){
    if(status) status.textContent = "Camera scanning isn't available in this browser context (common when opening the file directly, e.g. via file://, or in a preview pane). Use manual entry or quick lookup below.";
    return;
  }
  navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}})
    .then(stream=>{
      _scanStream = stream;
      video.srcObject = stream;
      video.play();
      if(status) status.style.display = "none";
      const ctx = canvas.getContext("2d");
      _scanInterval = setInterval(()=>{
        if(!video.videoWidth) return;
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imgData.data, imgData.width, imgData.height);
        if(code && code.data){
          const petId = parsePetQrValue(code.data);
          if(petId) handleScannedPetId(petId);
        }
      }, 350);
    })
    .catch(()=>{
      if(status) status.textContent = "Camera access was denied or unavailable. Use manual entry or quick lookup below.";
    });
}

/* After a QR scan resolves a pet, ask which service this in-person visit is
   for, then create a pre-approved, ready-to-complete request so staff can
   fill in the visit-specific fields (vaccine batch, microchip number, etc.)
   using the existing Services & Records form — this is what writes the new
   record onto the pet's permanent digital history. */
function promptQuickVisitService(pet){
  openModal(`
  <div class="modal-box">
    <h3>${esc(pet.name)} (${pet.id})</h3>
    <p style="font-size:0.8rem;color:var(--body);">Pet found. Which service is this visit for?</p>
    <div style="display:flex;flex-direction:column;gap:8px;margin:12px 0;">
      ${SERVICES.map(s=>`<button class="btn-line" style="text-align:left;" data-quickvisit="${esc(s)}">${esc(s)}</button>`).join("")}
    </div>
    <div class="modal-actions"><button class="btn-line" id="m-cancel">Cancel</button></div>
  </div>`);
  UI._quickVisitPetId = pet.id;
}
function startQuickVisit(service){
  const pet = petById(UI._quickVisitPetId);
  const staff = currentUser();
  if(!pet) return;
  const reqId = nextId("req");
  const req = {id:reqId, petId:pet.id, ownerId:pet.ownerId, service, remarks:"Recorded via QR scan (in-person visit).",
    submittedDate:todayISO(), status:"Approved", eligibility:null, staffDecision:"Approved", decisionDate:todayISO(),
    serviceRecord:null, source:"QR Scan"};
  S.requests.push(req);
  addAudit(staff.name, "Create", "Service Request", req.id, `${service} visit for ${pet.name} started via QR scan.`);
  saveState();
  closeModal();
  UI.selected.reqId = reqId;
  UI.screen = "servicesrecords";
  showToast(`${pet.name} found. Complete the visit details below to save the new record.`);
  render();
}
