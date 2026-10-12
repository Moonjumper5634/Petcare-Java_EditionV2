/* PetCARE — Login / sign-up / verify / forgot-password screens */

function renderLoginScreen(){
  return `
  <div class="login-split">
    <div class="login-left">
      <div class="login-brand-row">${sealSvg(46)}<div class="brand" style="margin-bottom:0;">PetCARE</div></div>
      <div class="brand-sub">City Veterinary Office — Santa Rosa, Laguna</div>
      <div class="brand-desc">Veterinary service request and decision-support portal for residents and CVO personnel. Register your pets, request veterinary services, and track requests from submission to completion.</div>
      <div class="brand-foot">Unauthorized access to staff and administrator accounts is prohibited.</div>
    </div>
    <div class="login-right">
      <div class="login-card2">
        <h1>Sign in to PetCARE</h1>
        <p class="tag">Enter your credentials to continue.</p>
        ${field("Email / Username", `<input id="li-email" placeholder="Enter your email" autocomplete="username" value="${esc(UI.loginEmail||'')}">`)}
        ${field("Password", `<input id="li-password" type="password" placeholder="••••••••" autocomplete="current-password">`)}
        ${UI.errors.login ? `<div class="field-error-msg" style="margin-bottom:10px;">${esc(UI.errors.login)}</div>` : ""}
        <div class="link-row" style="justify-content:center;"><span class="link-text" id="go-forgot">Forgot Password?</span></div>
        <button class="btn-primary" id="btn-do-login">Log In</button>
        <div class="foot-link-row">Don't have an account? <span class="link-text" id="go-signup">Create Resident Account</span></div>
      </div>
    </div>
  </div>`;
}

function renderSignupScreen(){
  const d = UI.signupDraft;
  return `
  <div class="login-split">
    <div class="login-left">
      <div class="brand">PetCARE</div>
      <div class="brand-sub">City Veterinary Office — Santa Rosa, Laguna</div>
      <div class="brand-desc">Register for access to PetCARE veterinary services and pet records.</div>
    </div>
    <div class="login-right" style="align-items:flex-start; overflow-y:auto;">
      <div class="login-card2" style="width:420px; padding-top:20px; padding-bottom:20px;">
        <h1>Create Resident Account</h1>
        <p class="tag">Register for access to PetCARE veterinary services and pet records.</p>
        <h3 style="font-size:0.85rem;border-left:3px solid var(--red);padding-left:8px;margin:16px 0 10px;">Personal Information</h3>
        ${field("First Name *", `<input id="su-first" value="${esc(d.firstName)}">`, "firstName")}
        ${field("Middle Name", `<input id="su-middle" value="${esc(d.middleName)}">`)}
        ${field("Last Name *", `<input id="su-last" value="${esc(d.lastName)}">`, "lastName")}
        <h3 style="font-size:0.85rem;border-left:3px solid var(--red);padding-left:8px;margin:16px 0 10px;">Contact Information</h3>
        ${field("Email Address *", `<input id="su-email" value="${esc(d.email)}">`, "email")}
        ${field("Mobile Number *", `<input id="su-mobile" value="${esc(d.mobile)}">`, "mobile")}
        <h3 style="font-size:0.85rem;border-left:3px solid var(--red);padding-left:8px;margin:16px 0 10px;">Address</h3>
        ${field("House/Street", `<input id="su-house" value="${esc(d.houseStreet)}">`)}
        ${field("Barangay *", `<select id="su-brgy">${BARANGAYS.map(b=>`<option ${d.barangay===b?"selected":""}>${b}</option>`).join("")}</select>`, "barangay")}
        <div class="two-field">
          ${field("City", `<input id="su-city" value="${esc(d.city)}">`)}
          ${field("Province", `<input id="su-province" value="${esc(d.province)}">`)}
        </div>
        <h3 style="font-size:0.85rem;border-left:3px solid var(--red);padding-left:8px;margin:16px 0 10px;">Account Security</h3>
        ${field("Password *", `<input id="su-pw" type="password" value="${esc(d.password)}">`, "password")}
        ${field("Confirm Password *", `<input id="su-confirm" type="password" value="${esc(d.confirm)}">`, "confirm")}
        <div class="checkbox-row">
          <input type="checkbox" id="su-agree" ${d.agree?"checked":""}>
          <label for="su-agree">I acknowledge that the information provided is accurate and agree to the use of my information for PetCARE service processing.</label>
        </div>
        ${UI.errors.agree ? `<div class="field-error-msg" style="margin-top:-10px;margin-bottom:10px;">${esc(UI.errors.agree)}</div>` : ""}
        <div class="wizard-nav">
          <button class="btn-line" id="su-cancel">Cancel</button>
          <button class="btn-red" id="su-submit">Create Account</button>
        </div>
        <div class="foot-link-row">Already have an account? <span class="link-text" id="go-login">Sign In</span></div>
      </div>
    </div>
  </div>`;
}

function renderSignupSuccessScreen(){
  return `
  <div class="login-split">
    <div class="login-left"><div class="brand">PetCARE</div><div class="brand-sub">City Veterinary Office — Santa Rosa, Laguna</div></div>
    <div class="login-right">
      <div class="login-card2" style="text-align:center;">
        <div style="color:var(--green);">${icoSvg('check',44)}</div>
        <h1>Account Created Successfully</h1>
        <div class="decision-box" style="margin:18px 0;">
          <div class="decision-title">Account Status</div>
          <div class="decision-status" style="color:var(--amber);">PENDING VERIFICATION</div>
          <p style="font-size:0.8rem;color:var(--body);margin:0;">A verification step is required before this account can be activated.</p>
        </div>
        <button class="btn-primary" id="go-verify">Continue to Verification</button>
      </div>
    </div>
  </div>`;
}

function renderVerifyScreen(){
  const u = userById(UI._justSignedUpId);
  return `
  <div class="login-split">
    <div class="login-left"><div class="brand">PetCARE</div><div class="brand-sub">City Veterinary Office — Santa Rosa, Laguna</div></div>
    <div class="login-right">
      <div class="login-card2">
        <h1>Verify Your Account</h1>
        <p class="tag">Enter the verification code sent to ${u?esc(u.email):"your email"}.</p>
        <div class="role-banner">Development verification code (no email service connected): <b>${u?u.verificationCode:DEV_VERIFICATION_CODE}</b></div>
        ${field("Verification Code", `<input id="vf-code" placeholder="123456" maxlength="6">`, "verify")}
        <button class="btn-primary" id="btn-do-verify">Verify Account</button>
      </div>
    </div>
  </div>`;
}
function renderVerifySuccessScreen(){
  return `
  <div class="login-split">
    <div class="login-left"><div class="brand">PetCARE</div><div class="brand-sub">City Veterinary Office — Santa Rosa, Laguna</div></div>
    <div class="login-right">
      <div class="login-card2" style="text-align:center;">
        <div style="color:var(--green);">${icoSvg('check',44)}</div>
        <h1>Account Activated Successfully</h1>
        <p style="font-size:0.85rem;color:var(--body);">You can now sign in to PetCARE with your email and password.</p>
        <button class="btn-primary" id="go-login-after-verify">Proceed to Login</button>
      </div>
    </div>
  </div>`;
}

function renderForgotEmailScreen(){
  return `
  <div class="login-split">
    <div class="login-left"><div class="brand">PetCARE</div><div class="brand-sub">City Veterinary Office — Santa Rosa, Laguna</div></div>
    <div class="login-right">
      <div class="login-card2">
        <h1>Forgot Password</h1>
        <p class="tag">Enter your account email to receive a verification code. This is a GUI simulation — no email is actually sent.</p>
        ${field("Email Address", `<input id="fg-email" placeholder="Enter your email" autocomplete="username" value="${esc(UI.loginEmail||'')}">`)}
        ${UI.errors.forgot?`<div class="field-error-msg" style="margin-bottom:10px;">${esc(UI.errors.forgot)}</div>`:""}
        <button class="btn-primary" id="btn-fg-send">Send Verification Code</button>
        <div class="foot-link-row"><span class="link-text" id="go-login">Back to Login</span></div>
      </div>
    </div>
  </div>`;
}
function renderForgotCodeScreen(){
  return `
  <div class="login-split">
    <div class="login-left"><div class="brand">PetCARE</div><div class="brand-sub">City Veterinary Office — Santa Rosa, Laguna</div></div>
    <div class="login-right">
      <div class="login-card2">
        <h1>Enter Verification Code</h1>
        <div class="role-banner">Development verification code (no email service connected): <b>${DEV_VERIFICATION_CODE}</b></div>
        ${field("Verification Code", `<input id="fg-code" placeholder="123456" maxlength="6">`)}
        ${UI.errors.forgot?`<div class="field-error-msg" style="margin-bottom:10px;">${esc(UI.errors.forgot)}</div>`:""}
        <button class="btn-primary" id="btn-fg-verify">Verify Code</button>
      </div>
    </div>
  </div>`;
}
function renderForgotNewPwScreen(){
  return `
  <div class="login-split">
    <div class="login-left"><div class="brand">PetCARE</div><div class="brand-sub">City Veterinary Office — Santa Rosa, Laguna</div></div>
    <div class="login-right">
      <div class="login-card2">
        <h1>Create New Password</h1>
        ${field("New Password", `<input id="fg-pw" type="password">`)}
        ${field("Confirm Password", `<input id="fg-confirm" type="password">`)}
        ${UI.errors.forgot?`<div class="field-error-msg" style="margin-bottom:10px;">${esc(UI.errors.forgot)}</div>`:""}
        <button class="btn-primary" id="btn-fg-setpw">Reset Password</button>
      </div>
    </div>
  </div>`;
}
function renderForgotSuccessScreen(){
  return `
  <div class="login-split">
    <div class="login-left"><div class="brand">PetCARE</div><div class="brand-sub">City Veterinary Office — Santa Rosa, Laguna</div></div>
    <div class="login-right">
      <div class="login-card2" style="text-align:center;">
        <div style="font-size:2.4rem;">🔑</div>
        <h1>Password Reset Successful</h1>
        <p style="font-size:0.85rem;color:var(--body);">You can now sign in with your new password.</p>
        <button class="btn-primary" id="go-login">Return to Login</button>
      </div>
    </div>
  </div>`;
}

function renderAuth(){
  switch(UI.authScreen){
    case "signup": return renderSignupScreen();
    case "signupSuccess": return renderSignupSuccessScreen();
    case "verify": return renderVerifyScreen();
    case "verifySuccess": return renderVerifySuccessScreen();
    case "forgotEmail": return renderForgotEmailScreen();
    case "forgotCode": return renderForgotCodeScreen();
    case "forgotNewPw": return renderForgotNewPwScreen();
    case "forgotSuccess": return renderForgotSuccessScreen();
    default: return renderLoginScreen();
  }
}
