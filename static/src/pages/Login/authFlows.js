/* PetCARE — Login, logout, sign-up, verification and forgot-password flows (UI layer over AuthService) */

/* ---------------- LOGIN / LOGOUT ---------------- */
async function doLogin(email, password){
  UI.errors = {};
  UI.loginEmail = String(email || "").trim();
  const result = await AuthService.login(email, password);
  if(!result.ok){ UI.errors.login = result.error; render(); return; }
  UI.loginEmail = "";
  UI.screen = AuthGuard.homeScreen(result.user.role);
  showToast(`Welcome back, ${result.user.name}.`);
  render();
}
function doLogout(){
  AuthService.logout();
  UI = defaultUI();   // clears wizards, selections, modals and drafts
  render();
}

/* ---------------- SIGN-UP / VERIFY / FORGOT ---------------- */

function startSignup(){
  UI.signupDraft = {firstName:"", middleName:"", lastName:"", email:"", mobile:"", houseStreet:"", barangay:BARANGAYS[0], city:"Santa Rosa", province:"Laguna", password:"", confirm:"", agree:false};
  UI.authScreen = "signup";
  render();
}
function submitSignup(data){
  const errs = {};
  if(!data.firstName) errs.firstName = "Required field";
  if(!data.lastName) errs.lastName = "Required field";
  if(!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errs.email = "Invalid email";
  else if(S.users.some(u=>u.email.toLowerCase()===data.email.toLowerCase())) errs.email = "An account with this email already exists";
  if(!data.mobile) errs.mobile = "Required field";
  if(!data.barangay) errs.barangay = "Missing barangay";
  if(!data.password || data.password.length < 6) errs.password = "Password must be at least 6 characters";
  if(data.password !== data.confirm) errs.confirm = "Password mismatch";
  if(!data.agree) errs.agree = "Required field";
  if(Object.keys(errs).length){ UI.errors = errs; UI.signupDraft = data; render(); return; }

  const id = nextId("user");
  const code = DEV_VERIFICATION_CODE;
  const user = {
    id, role:"owner", firstName:data.firstName, middleName:data.middleName, lastName:data.lastName,
    name:`${data.firstName} ${data.lastName}`.trim(), email:data.email, mobile:data.mobile,
    houseStreet:data.houseStreet, barangay:data.barangay, city:data.city, province:data.province,
    passwordHash:DevCredentials.hash(data.password), status:"Pending Verification", verificationCode:code,
  };
  S.users.push(user);
  addAudit(user.name, "Create", "User Management", id, "Resident account created — pending verification.");
  saveState();
  UI._justSignedUpId = id;
  UI.authScreen = "signupSuccess";
  render();
}
function goToVerify(){
  UI.authScreen = "verify";
  UI.errors = {};
  render();
}
function submitVerify(code){
  const u = userById(UI._justSignedUpId);
  if(!u){ UI.authScreen="login"; render(); return; }
  if(code !== u.verificationCode){
    UI.errors = {verify:"Invalid verification code. Use the development code shown above."};
    render(); return;
  }
  u.status = "Active";
  addAudit(u.name, "Update", "User Management", u.id, "Account verified — status set to Active.");
  addNotification(u.id, "Account activated successfully.", "Your PetCARE account is now active. You may log in and register your pets.");
  saveState();
  UI.authScreen = "verifySuccess";
  render();
}

function startForgot(){
  UI.forgotDraft = {email:"", code:"", newPw:"", confirm:""};
  UI.authScreen = "forgotEmail";
  UI.errors = {};
  render();
}
function forgotSendCode(email){
  const u = S.users.find(x=>x.email.toLowerCase()===String(email).trim().toLowerCase());
  if(!u){ UI.errors = {forgot:"No account found with that email."}; render(); return; }
  UI._forgotUserId = u.id;
  UI.errors = {};
  UI.authScreen = "forgotCode";
  render();
}
function forgotVerifyCode(code){
  if(code !== DEV_VERIFICATION_CODE){ UI.errors = {forgot:"Invalid verification code. Use the development code shown above."}; render(); return; }
  UI.errors = {};
  UI.authScreen = "forgotNewPw";
  render();
}
function forgotSetPassword(pw, confirm){
  if(!pw || pw.length < 6){ UI.errors = {forgot:"Password must be at least 6 characters"}; render(); return; }
  if(pw !== confirm){ UI.errors = {forgot:"Password mismatch"}; render(); return; }
  const u = userById(UI._forgotUserId);
  u.passwordHash = DevCredentials.hash(pw);
  addAudit(u.name, "Update", "User Management", u.id, "Password reset via Forgot Password flow.");
  saveState();
  UI.authScreen = "forgotSuccess";
  render();
}
