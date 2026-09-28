import { useRef, useState } from "react";
import { useAuth } from "../data/AuthContext";
import { friendlyAuthError } from "../utils/authErrors";
import { GoogleIcon } from "./Icons";

// Shared "Continue with Google" button for Login and Signup.
// - Ignores extra clicks while a popup is already open (a second click is
//   what causes `auth/cancelled-popup-request`).
// - Passes the typed email as a hint so Google's account chooser can preselect it.
// - Reports its busy state so the parent can lock the rest of the form.
export default function GoogleButton({ disabled = false, emailHint = "", onError, onBusyChange }) {
  const { loginWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);

  const handleClick = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    onBusyChange?.(true);
    onError?.("");
    try {
      await loginWithGoogle(emailHint);
      // Navigation happens in the page: once the auth state updates, the
      // <Navigate> guard in Login/Signup redirects signed-in users.
    } catch (err) {
      onError?.(friendlyAuthError(err));
    } finally {
      inFlight.current = false;
      setBusy(false);
      onBusyChange?.(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || busy}
      className="w-full flex items-center justify-center gap-2.5 text-sm font-medium px-4 py-2.5 rounded-lg text-neutral-100 transition disabled:opacity-40 bg-white/[0.04] border border-white/10 hover:bg-white/[0.07] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40"
    >
      <GoogleIcon width={16} height={16} />
      {busy ? "Waiting for Google…" : "Continue with Google"}
    </button>
  );
}
