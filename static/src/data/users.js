/* PetCARE — Mock user accounts
   ============================================================
   DEVELOPMENT / TEST DATA ONLY. The plaintext passwords below exist solely to
   seed the local mock store; they are hashed on load and never persisted in
   plaintext. A real deployment stores only server-side hashes (bcrypt/argon2).
   Documented in README.md (Test Accounts).
   ============================================================ */
function mockUsers(){
  const TEST_ACCOUNTS = [
      {id:"U-1001", role:"owner", firstName:"Maria", middleName:"", lastName:"Santos", name:"Maria Santos",
        email:"resident@petcare.local", mobile:"0917 123 4567", houseStreet:"Purok 3", barangay:"Balibago",
        city:"Santa Rosa", province:"Laguna", password:"Resident#2026", status:"Active"},

      {id:"U-1002", role:"owner", firstName:"Ana", middleName:"", lastName:"Reyes", name:"Ana Reyes",
        email:"ana.reyes@email.com", mobile:"0919 345 6789", houseStreet:"Purok 1", barangay:"Dita",
        city:"Santa Rosa", province:"Laguna", password:"Petcare#2026", status:"Active"},

      {id:"U-1003", role:"owner", firstName:"Juan", middleName:"", lastName:"Dela Cruz", name:"Juan Dela Cruz",
        email:"juan.delacruz@email.com", mobile:"0918 234 5678", houseStreet:"Purok 5", barangay:"Pooc",
        city:"Santa Rosa", province:"Laguna", password:"Petcare#2026", status:"Active"},

      {id:"U-1004", role:"owner", firstName:"Pedro", middleName:"", lastName:"Villanueva", name:"Pedro Villanueva",
        email:"pedro.villanueva@email.com", mobile:"0922 678 9012", houseStreet:"Purok 7", barangay:"Pooc",
        city:"Santa Rosa", province:"Laguna", password:"Petcare#2026", status:"Active"},

      {id:"U-2001", role:"staff", name:"Rowena Tan", email:"staff@petcare.local",
        password:"Staff#2026", status:"Active", initials:"RT", tag:"CVO Staff / Veterinarian"},

      {id:"U-2002", role:"staff", name:"Miguel Alonzo", email:"miguel.alonzo@santarosalaguna.gov.ph",
        password:"Petcare#2026", status:"Active", initials:"MA", tag:"CVO Staff"},

      {id:"U-3001", role:"admin", name:"Jose Dizon", email:"admin@petcare.local",
        password:"Admin#2026", status:"Active", initials:"JD", tag:"System Administrator"},
  ];
  return TEST_ACCOUNTS.map(({password, ...rest}) => ({...rest, passwordHash: DevCredentials.hash(password)}));
}
