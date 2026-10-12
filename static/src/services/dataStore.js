/* PetCARE — Local mock data store (localStorage). DEVELOPMENT ONLY - replace with API calls */

/* ---------------- ID GENERATORS ---------------- */
function nextId(kind){
  const n = S.nextIds[kind]++;
  const map = {reg:"REG-", req:"REQ-", adopt:"ADOPT-", pet:"P-", user:"U-", notif:"N-", audit:"A-"};
  return map[kind] + n;
}

/* ---------------- STATE LOAD / SAVE ---------------- */
var S = null;
function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){ S = JSON.parse(raw); return; }
  }catch(e){ /* fall through to seed */ }
  S = seedState();
  saveState();
}
function saveState(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(S)); }catch(e){ /* storage unavailable */ }
}
function resetLocalData(){
  if(!AuthService.hasRole("admin")) return;   // admin-only action (guard in addition to the UI)
  S = seedState();
  saveState();
  AuthService.logout();
  UI = defaultUI();
  render();
}


/* ---------------- LOOKUP HELPERS ----------------
   Thin wrappers over the service layer so screens never touch raw data directly
   for reads. Swap the services for API calls and these keep working. */
function currentUser(){ return AuthService.getCurrentUser(); }
function userById(id){ return ResidentService.getUserById(id); }
function petById(id){ return PetService.getPetById(id); }
function regById(id){ return VeterinaryService.getRegistrationById(id); }
function reqById(id){ return VeterinaryService.getRequestById(id); }
function adoptById(id){ return VeterinaryService.getAdoptionById(id); }
function shelterById(id){ return VeterinaryService.getShelterPetById(id); }
function ownerPets(ownerId){ return PetService.getPetsByOwner(ownerId); }
function verifiedOwnerPets(ownerId){ return PetService.getVerifiedPetsByOwner(ownerId); }


/* ---------------- NOTIFICATIONS & AUDIT ---------------- */
function addNotification(userId, title, body){
  S.notifications.unshift({id:nextId("notif"), userId, title, body, date:todayISO(), read:false});
}
function addAudit(userName, action, module, refId, description){
  S.audit.unshift({id:nextId("audit"), datetime:new Date(TODAY).toISOString(), user:userName, action, module, refId, description});
}
function unreadCount(userId){
  return S.notifications.filter(n=>n.userId===userId && !n.read).length;
}
