// Maps Firebase Auth error codes to short, user-facing messages.
// Login failures deliberately stay generic ("Incorrect email or password")
// so the form never reveals whether an email is registered.
export function friendlyAuthError(err) {
  const code = err?.code || "";

  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found")) {
    return "Incorrect email or password.";
  }
  if (code.includes("email-already-in-use")) return "An account with that email already exists.";
  if (code.includes("weak-password") || code.includes("password-does-not-meet-requirements")) {
    return "That password doesn't meet the security requirements.";
  }
  if (code.includes("invalid-email") || code.includes("missing-email")) return "That email address looks invalid.";
  if (code.includes("user-disabled")) return "This account has been disabled. Please contact support.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a few minutes and try again.";
  if (code.includes("operation-not-allowed")) return "This sign-in method isn't enabled for this project yet.";
  if (code.includes("network-request-failed")) return "Network error — check your connection and try again.";

  // Google popup
  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request")) return "";
  if (code.includes("popup-blocked")) {
    return "Your browser blocked the sign-in popup. Allow popups for this site and try again.";
  }
  if (code.includes("unauthorized-domain")) {
    return "This domain isn't authorised for Google sign-in. Add it under Firebase Console → Authentication → Settings → Authorized domains.";
  }
  if (code.includes("operation-not-supported-in-this-environment") || code.includes("web-storage-unsupported")) {
    return "Your browser is blocking the storage sign-in needs. Turn off private mode or allow cookies, then try again.";
  }
  if (code.includes("account-exists-with-different-credential")) {
    return "An account already exists with this email using a different sign-in method.";
  }
  return "Something went wrong. Please try again.";
}
