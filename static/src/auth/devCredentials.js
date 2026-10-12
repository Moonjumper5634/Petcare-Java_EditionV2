/* PetCARE — Development-only credential hashing
   ============================================================
   NOT SECURE. This is a small salted checksum so the local mock store never
   keeps plaintext passwords. It exists only until a real backend is connected.
   Production: hash server-side with bcrypt/argon2 and never hash in the browser. */
const DevCredentials = (function(){
  const SALT = "petcare-local-dev";
  function hash(plain){
    let h1 = 0x811c9dc5, h2 = 0x01000193;
    const s = SALT + String(plain);
    for(let i = 0; i < s.length; i++){
      const c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
      h2 = Math.imul(h2 + c, 2246822519) >>> 0;
    }
    return "dev$" + h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
  }
  function verify(plain, stored){ return hash(plain) === stored; }
  return { hash, verify };
})();
