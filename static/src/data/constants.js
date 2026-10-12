/* PetCARE — Application constants (dates, barangays, services, storage key) */

/* =========================================================================
   PetCARE — City Veterinary Office, Santa Rosa, Laguna
   Revised prototype: real state, role-based navigation, multi-step
   workflows, service-specific eligibility, staff decision separation,
   walk-in flow, adoption flow, notifications & audit logs.
   ========================================================================= */

const TODAY = new Date(2026,7,17); // Fixed reference date (Aug 17, 2026) so seeded records and eligibility results stay consistent in local development
const STORAGE_KEY = "petcare_local_state_v3"; // localStorage key for the mock data store (development only)
const DEV_VERIFICATION_CODE = "123456"; // stand-in for an emailed/SMS one-time code until a backend exists
const BARANGAYS = ["Balibago","Pooc","Dita","Ibaba","Sinalhan"];
const SERVICES = ["Anti-Rabies Vaccination","Microchipping","Kapon / Spay-Neuter"];
const HOUSING_TYPES = ["Owned House","Rented House/Apartment","Condominium","Living with Family"];
