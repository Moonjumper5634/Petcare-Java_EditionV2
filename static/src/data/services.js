/* PetCARE — Service eligibility criteria (configurable by Administrator) */
function mockCriteria(){
  return {
      "Anti-Rabies Vaccination":[
        {key:"registered", label:"Pet Registration", desc:"Pet must be registered and verified with the CVO.", enabled:true},
        {key:"minAge", label:"Minimum Applicable Age", desc:"Pet must be at least 3 months old.", enabled:true},
        {key:"recentVax", label:"Recent Anti-Rabies Vaccination", desc:"No anti-rabies vaccine administered within the past 12 months.", enabled:true},
        {key:"medical", label:"Medical Restriction", desc:"CVO Verification — confirmed at the time of vaccination.", enabled:true},
      ],
      "Microchipping":[
        {key:"registered", label:"Pet Registration", desc:"Pet must be registered and verified with the CVO.", enabled:true},
        {key:"minAge6", label:"Minimum Age", desc:"Dog must be 6 months old and above (per CVO Microchipping campaign requirement).", enabled:true},
        {key:"noChip", label:"Existing Microchip", desc:"No existing microchip number already recorded for the pet.", enabled:true},
        {key:"info", label:"Required Pet Information", desc:"Breed and physical description must be on file.", enabled:true},
      ],
      "Kapon / Spay-Neuter":[
        {key:"registered", label:"Pet Registered and Verified", desc:"Pet must be registered and verified with the CVO.", enabled:true},
        {key:"ageRange", label:"Age within CVO Kapon Range", desc:"Dog must be 5 months to 4 years old, per the supplied CVO Kapon announcement.", enabled:true},
        {key:"weight", label:"Weight Requirement Satisfied", desc:"Dog must meet the CVO Kapon weight requirement (sample reference: at least 3 kg — verify exact figure against the official announcement).", enabled:true},
        {key:"healthy", label:"Apparently Healthy", desc:"Dog must be recorded as apparently healthy on the pet profile.", enabled:true},
        {key:"rabies", label:"Anti-Rabies Updated", desc:"Dog's anti-rabies vaccination must be on file and updated.", enabled:true},
        {key:"deworm", label:"Deworming Updated", desc:"Dog's deworming record must be on file and updated.", enabled:true},
        {key:"residency", label:"Owner Proof of Residency Verified", desc:"Owner's proof of residency must be verified by the barangay/CVO.", enabled:true},
      ],

  };
}
