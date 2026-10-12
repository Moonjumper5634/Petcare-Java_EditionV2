/* PetCARE — Decision Tree-Based Service Eligibility Classification */

/* ---------------- ELIGIBILITY ENGINE ----------------
   Decision-tree-based eligibility classification. Each criterion returns a
   result of PASS, FAIL, or REVIEW along with the actual registered value used
   and a short basis. The classification is decided as:
     NOT ELIGIBLE — at least one required condition FAILED
     FOR REVIEW   — no FAIL, but at least one condition needs CVO verification
     ELIGIBLE     — every required condition PASSED
   decisionPath[] mirrors criteria[] for the visual decision-tree rendering,
   with an added START node and a FINAL CLASSIFICATION node. */
function classifyResult(criteria){
  if(criteria.some(c=>c.result==="FAIL")) return "NOT ELIGIBLE";
  if(criteria.some(c=>c.result==="REVIEW")) return "FOR REVIEW";
  return "ELIGIBLE";
}
function buildDecisionPath(criteria, classification){
  const path = [{type:"start", label:"START", value:"Eligibility Assessment Initiated"}];
  criteria.forEach(c=> path.push({type:"node", label:c.label, value:c.value, result:c.result, basis:c.basis}));
  path.push({type:"final", label:"FINAL CLASSIFICATION", value:classification});
  return path;
}
function assessEligibility(pet, service){
  const criteria = [];

  if(service === "Anti-Rabies Vaccination"){
    const regPass = pet.registrationStatus === "Verified";
    criteria.push({label:"Pet Registration", value:pet.registrationStatus, result: regPass?"PASS":"FAIL",
      basis: regPass ? "Pet registration is verified." : "Pet registration is not yet verified by CVO staff."});
    const ageM = monthsBetween(pet.dob);
    const agePass = ageM >= 3;
    criteria.push({label:"Minimum Applicable Age", value:ageString(pet.dob), result: agePass?"PASS":"FAIL",
      basis: agePass ? "Pet is at least 3 months old." : "Pet is younger than the minimum applicable age of 3 months."});
    let recentResult, recentVal;
    if(!pet.lastRabies){ recentResult="PASS"; recentVal="No prior record on file"; }
    else { const m = monthsBetween(pet.lastRabies); recentResult = m>=12 ? "PASS":"FAIL"; recentVal = fmtDate(pet.lastRabies); }
    criteria.push({label:"Recent Anti-Rabies Vaccination", value:recentVal, result:recentResult,
      basis: recentResult==="PASS" ? "No anti-rabies vaccination recorded within the past 12 months." : "A recent anti-rabies vaccination record exists within the configured restriction period."});
    criteria.push({label:"Medical Restriction", value:"Not on file", result:"REVIEW",
      basis:"CVO Verification — no source confirms this rule; final medical clearance is verified by attending CVO staff at the time of service."});
  }

  else if(service === "Microchipping"){
    const regPass = pet.registrationStatus === "Verified";
    criteria.push({label:"Pet Registration", value:pet.registrationStatus, result: regPass?"PASS":"FAIL",
      basis: regPass ? "Pet registration is verified." : "Pet registration is not yet verified by CVO staff."});
    const ageM = monthsBetween(pet.dob);
    const agePass = ageM >= 6;
    criteria.push({label:"Minimum Age (6 Months and Above)", value:ageString(pet.dob), result: agePass?"PASS":"FAIL",
      basis: agePass ? "Dog is 6 months old or above, per the CVO Microchipping campaign requirement." : "Dog is younger than the required minimum age of 6 months."});
    const chipPass = pet.microchipStatus !== "Microchipped" && !pet.microchip;
    criteria.push({label:"Existing Microchip", value: pet.microchip || "None on file", result: chipPass?"PASS":"FAIL",
      basis: chipPass ? "No existing microchip number is on file." : "A microchip number is already recorded for this pet."});
    const infoPass = !!(pet.breed && pet.color);
    criteria.push({label:"Required Pet Information", value: infoPass ? "Complete":"Incomplete", result: infoPass?"PASS":"REVIEW",
      basis: infoPass ? "Required pet information (breed, physical description) is complete." : "Required pet information is incomplete and needs CVO verification."});
  }

  else if(service === "Kapon / Spay-Neuter"){
    const regPass = pet.registrationStatus === "Verified";
    criteria.push({label:"Pet Registered and Verified", value:pet.registrationStatus, result: regPass?"PASS":"FAIL",
      basis: regPass ? "Pet registration is verified." : "Pet registration is not yet verified by CVO staff."});

    const ageM = monthsBetween(pet.dob);
    const agePass = ageM >= 5 && ageM <= 48;
    criteria.push({label:"Age within CVO Kapon Range (5 Months – 4 Years)", value:ageString(pet.dob), result: agePass?"PASS":"FAIL",
      basis: agePass ? "Dog's age falls within the 5-month to 4-year Kapon eligibility range." : "Dog's age falls outside the 5-month to 4-year Kapon eligibility range."});

    let wResult, wVal;
    if(pet.weight==null || pet.weight===""){ wResult="REVIEW"; wVal="Not on file"; }
    else { wResult = pet.weight >= 3 ? "PASS" : "FAIL"; wVal = pet.weight+" kg"; }
    criteria.push({label:"Weight Requirement Satisfied", value:wVal, result:wResult,
      basis: wResult==="REVIEW" ? "Weight is not on file and requires CVO verification."
        : wResult==="PASS" ? "Recorded weight meets the sample CVO Kapon weight requirement (minimum 3 kg — verify exact figure against the official announcement)."
        : "Recorded weight does not meet the sample CVO Kapon weight requirement (minimum 3 kg — verify exact figure against the official announcement)."});

    let hResult = pet.healthStatus==="Apparently Healthy" ? "PASS" : pet.healthStatus==="With Known Condition" ? "FAIL" : "REVIEW";
    criteria.push({label:"Apparently Healthy", value:pet.healthStatus||"Not on file", result:hResult,
      basis: hResult==="PASS" ? "Pet profile records the dog as apparently healthy."
        : hResult==="FAIL" ? "Pet profile records a known health condition that requires veterinary clearance."
        : "Health status is marked For Verification and requires a CVO physical exam."});

    let rResult, rVal;
    if(pet.rabiesStatus==="Updated" && pet.lastRabies){ rResult="PASS"; rVal=fmtDate(pet.lastRabies); }
    else if(pet.rabiesStatus==="Not Updated"){ rResult="FAIL"; rVal="Not Updated"; }
    else { rResult="REVIEW"; rVal="Unknown / not on file"; }
    criteria.push({label:"Anti-Rabies Updated", value:rVal, result:rResult,
      basis: rResult==="PASS" ? "Anti-rabies vaccination is on file and updated."
        : rResult==="FAIL" ? "Anti-rabies vaccination record is on file but is not updated."
        : "Anti-rabies vaccination status is unknown and requires CVO verification."});

    let dResult, dVal;
    if(pet.dewormingStatus==="Updated" && pet.lastDeworming){ dResult="PASS"; dVal=fmtDate(pet.lastDeworming); }
    else if(pet.dewormingStatus==="Not Updated"){ dResult="FAIL"; dVal="Not Updated"; }
    else { dResult="REVIEW"; dVal="Unknown / not on file"; }
    criteria.push({label:"Deworming Updated", value:dVal, result:dResult,
      basis: dResult==="PASS" ? "Deworming record is on file and updated."
        : dResult==="FAIL" ? "Deworming record is on file but is not updated."
        : "Deworming status is unknown and requires CVO verification. Deworming is tracked as a health/requirement record, not a standalone service."});

    let pResult = pet.proofOfResidency==="Verified at Barangay" ? "PASS" : pet.proofOfResidency==="Not Submitted" ? "FAIL" : "REVIEW";
    criteria.push({label:"Owner Proof of Residency Verified", value:pet.proofOfResidency||"Not on file", result:pResult,
      basis: pResult==="PASS" ? "Owner's proof of residency has been verified at the barangay."
        : pResult==="FAIL" ? "Owner has not submitted proof of residency."
        : "Owner's proof of residency has been submitted but is still pending verification."});
  }

  const classification = classifyResult(criteria);
  const decisionPath = buildDecisionPath(criteria, classification);
  return {
    eligible: classification === "ELIGIBLE",
    classification,
    criteria,
    decisionPath,
    assessedDate: todayISO()
  };
}

/* ---------------- SERVICE FACADE ----------------
   Single entry point for the Decision Tree-Based Service Eligibility Classification.
   FUTURE BACKEND: evaluate() -> POST /api/eligibility/evaluate  {petId, service}
   (the server would run the same decision tree and return {criteria, classification, decisionPath}). */
const EligibilityService = {
  evaluate(pet, service){ return assessEligibility(pet, service); },
  classify(criteria){ return classifyResult(criteria); },
};
