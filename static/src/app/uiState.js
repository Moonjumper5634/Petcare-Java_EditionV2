/* PetCARE — Transient (non-persisted) UI state */

/* ---------------- TRANSIENT UI STATE (not persisted) ---------------- */
function defaultUI(){
  return {
    view:"login",              // "login" | "app"
    authScreen:"login",        // login|signup|signupSuccess|verify|verifySuccess|forgotEmail|forgotCode|forgotNewPw|forgotSuccess
    screen:"dashboard",
    selected:{petId:null, regId:null, reqId:null, adoptId:null, shelterId:null},
    signupDraft:{},
    forgotDraft:{},
    wiz:{},                    // active wizard state, keyed by wizard name
    modal:null,                // {type, data}
    cancelTarget:null,         // function to call on discard-cancel confirmation
    toasts:[],
    errors:{},
    filters:{},
  };
}
var UI = defaultUI();
