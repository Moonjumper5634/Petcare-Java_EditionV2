/* PetCARE — Seed data for the local development store */

/* ---------------- SEED DATA ---------------- */
function seedState(){
  return {
    users: mockUsers(),
    pets: mockPets(),
    registrations: [
      {id:"REG-1002", petId:"P-1049", ownerId:"U-1004", status:"Pending", submittedDate:"2026-08-11",
        source:"Owner", rejectionReason:null},
    ],
    requests: [
      {id:"REQ-3301", petId:"P-1042", ownerId:"U-1001", service:"Anti-Rabies Vaccination", remarks:"",
        submittedDate:"2026-01-20", source:"Owner",
        eligibility:{eligible:true, classification:"ELIGIBLE", criteria:[
          {label:"Pet Registration", value:"Verified", result:"PASS", basis:"Pet registration is verified."},
          {label:"Minimum Applicable Age", value:"1y 3m", result:"PASS", basis:"Pet is at least 3 months old."},
          {label:"Recent Anti-Rabies Vaccination", value:"No prior record on file", result:"PASS", basis:"No anti-rabies vaccination recorded within the past 12 months."},
          {label:"Medical Restriction", value:"Cleared", result:"PASS", basis:"No medical restriction was recorded at the time of assessment."}
        ],
        decisionPath:[
          {type:"start", label:"START", value:"Eligibility Assessment Initiated"},
          {type:"node", label:"Pet Registration", value:"Verified", result:"PASS", basis:"Pet registration is verified."},
          {type:"node", label:"Minimum Applicable Age", value:"1y 3m", result:"PASS", basis:"Pet is at least 3 months old."},
          {type:"node", label:"Recent Anti-Rabies Vaccination", value:"No prior record on file", result:"PASS", basis:"No anti-rabies vaccination recorded within the past 12 months."},
          {type:"node", label:"Medical Restriction", value:"Cleared", result:"PASS", basis:"No medical restriction was recorded at the time of assessment."},
          {type:"final", label:"FINAL CLASSIFICATION", value:"ELIGIBLE"}
        ], assessedDate:"2026-01-21"},
        staffDecision:"Approved", decisionDate:"2026-01-22", rejectionReason:null,
        serviceRecord:{date:"2026-08-02", staff:"Dr. Rowena Tan, DVM", remarks:"Routine booster administered, no adverse reaction observed.",
          vaccineType:"Rabisin", batchNumber:"AR-2026-0417", nextDue:"2027-08-02"},
        status:"Completed"},
      {id:"REQ-3302", petId:"P-1044", ownerId:"U-1003", service:"Microchipping", remarks:"",
        submittedDate:"2026-08-10", source:"Owner",
        eligibility:null, staffDecision:"Pending", decisionDate:null, rejectionReason:null,
        serviceRecord:null, status:"For Review"},
    ],
    adoptions: [],
    shelterPets: [
      {id:"S-201", name:"Brownie", species:"Dog", breed:"Aspin Mix", sex:"Male", age:"~1 year",
        description:"Brownie was surrendered by a relocating family and has been at the CVO shelter since July.",
        temperament:"Friendly, good with children, house-trained.", status:"Available", intake:"2026-07-02",
        photo:"https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=300&q=80"},
      {id:"S-202", name:"Lucky", species:"Dog", breed:"Aspin", sex:"Female", age:"~2 years",
        description:"Lucky was rescued from a barangay flood evacuation site and has fully recovered.",
        temperament:"Calm, gentle, good with other pets.", status:"Available", intake:"2026-06-20",
        photo:"https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80"},
      {id:"S-203", name:"Tosca", species:"Dog", breed:"Aspin Mix", sex:"Female", age:"~8 months",
        description:"Tosca was found as a stray puppy near the public market and was brought in for shelter care.",
        temperament:"Playful, energetic, still learning basic commands.", status:"Available", intake:"2026-08-01",
        photo:"https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80"},
    ],
    notifications: [],
    audit: [],
    criteria: mockCriteria(),
    nextIds:{reg:1003, req:3303, adopt:1001, pet:1050, user:4001, notif:1, audit:1},
  };
}
