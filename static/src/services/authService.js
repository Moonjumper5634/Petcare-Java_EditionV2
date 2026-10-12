/* PetCARE — Authentication service
   ============================================================
   LOCAL DEVELOPMENT AUTHENTICATION. Checks credentials against the mock store
   and keeps a session in sessionStorage. This is NOT production-grade security.
   The UI talks only to this object, so connecting a backend means changing the
   bodies below, not the screens:
     login()           -> POST /api/auth/login     (returns user + sets session cookie)
     logout()          -> POST /api/auth/logout
     getCurrentUser()  -> GET  /api/auth/me
     changePassword()  -> POST /api/auth/change-password
   Roles used internally: "owner" (Resident), "staff" (CVO Staff), "admin" (Administrator). */
const AuthService = (function(){
  function findByEmail(email){
    const e = String(email || "").trim().toLowerCase();
    return S.users.find(u => u.email.toLowerCase() === e) || null;
  }

  async function login(email, password){
    const user = findByEmail(email);
    if(!user || !DevCredentials.verify(String(password || ""), user.passwordHash)){
      return { ok:false, error:"Invalid email or password." };
    }
    if(user.status === "Pending Verification") return { ok:false, error:"This account is pending verification. Please verify your account first." };
    if(user.status !== "Active") return { ok:false, error:"This account has been deactivated. Please contact the CVO office." };
    Session.start(user);
    return { ok:true, user };
  }

  function logout(){ Session.clear(); }

  function getCurrentUser(){
    const s = Session.read();
    if(!s || !S) return null;
    const u = S.users.find(x => x.id === s.userId);
    if(!u || u.status !== "Active"){ Session.clear(); return null; }
    return u;
  }
  function isAuthenticated(){ return !!getCurrentUser(); }
  function getUserRole(){ const u = getCurrentUser(); return u ? u.role : null; }
  function hasRole(...roles){ return roles.includes(getUserRole()); }

  async function changePassword(currentPassword, newPassword){
    const u = getCurrentUser();
    if(!u) return { ok:false, error:"Not signed in." };
    if(!DevCredentials.verify(currentPassword, u.passwordHash)) return { ok:false, error:"Current password is incorrect." };
    if(!newPassword || newPassword.length < 6) return { ok:false, error:"New password must be at least 6 characters." };
    u.passwordHash = DevCredentials.hash(newPassword);
    addAudit(u.name, "Update", "User Management", u.id, "Password changed from Profile.");
    saveState();
    return { ok:true };
  }

  return { login, logout, getCurrentUser, isAuthenticated, getUserRole, hasRole, changePassword };
})();
