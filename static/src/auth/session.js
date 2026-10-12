/* PetCARE — Session (local development)
   ============================================================
   Stores only {userId, role, issuedAt, expiresAt} in sessionStorage (cleared when
   the tab closes). The role stored here is NOT trusted: AuthService re-reads the
   role from the user record on every request.
   FUTURE BACKEND: replace with an HttpOnly session cookie or short-lived JWT
   issued by POST /api/auth/login; the browser should not hold the session. */
const Session = (function(){
  const KEY = "petcare.dev.session";
  const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
  function read(){
    try{
      const raw = sessionStorage.getItem(KEY);
      if(!raw) return null;
      const s = JSON.parse(raw);
      if(!s || !s.userId || Date.now() > s.expiresAt){ clear(); return null; }
      return s;
    }catch(e){ return null; }
  }
  function start(user){
    try{
      sessionStorage.setItem(KEY, JSON.stringify({
        userId:user.id, role:user.role, issuedAt:Date.now(), expiresAt:Date.now() + TTL_MS,
      }));
    }catch(e){ /* storage unavailable */ }
  }
  function clear(){ try{ sessionStorage.removeItem(KEY); }catch(e){} }
  return { read, start, clear };
})();
