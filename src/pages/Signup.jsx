import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../data/AuthContext";
import { friendlyAuthError } from "../utils/authErrors";
import { checkPassword, isValidEmail, normalizeEmail, normalizeName } from "../utils/authValidation";
import { CardStackIcon } from "../components/Icons";
import PasswordInput from "../components/PasswordInput";
import PasswordStrength from "../components/PasswordStrength";
import GoogleButton from "../components/GoogleButton";

const fieldCls =
  "w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40 transition";

export default function Signup() {
  const { user, signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  const policy = useMemo(() => checkPassword(password, { email, name }), [password, email, name]);
  const mismatch = confirm.length > 0 && password !== confirm;
  const canSubmit = name.trim() && email && policy.passed && password === confirm;

  // Signed in (including right after a successful signup) → dashboard.
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      setError("That email address looks invalid.");
      return;
    }
    // Re-checked here so the rules can't be bypassed by skipping the disabled button.
    if (!policy.passed) {
      setError("Your password doesn't meet all the requirements yet.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setBusy(true);
    try {
      await signup(cleanEmail, password, normalizeName(name));
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-neutral-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <span className="w-9 h-9 rounded-lg bg-indigo-500/15 border border-indigo-400/20 flex items-center justify-center text-indigo-300">
            <CardStackIcon width={18} height={18} />
          </span>
          <div className="leading-tight text-left">
            <p className="text-sm font-semibold text-white">AASHA-SM Technologies</p>
            <p className="text-[10px] tracking-wide text-neutral-500 font-medium">DIGITAL VISITING CARDS</p>
          </div>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h1 className="text-lg font-semibold text-white mb-1">Create an account</h1>
          <p className="text-xs text-neutral-500 mb-5">Set up access to manage your team's cards.</p>

          <GoogleButton
            disabled={busy}
            emailHint={isValidEmail(normalizeEmail(email)) ? email : ""}
            onError={setError}
            onBusyChange={setGoogleBusy}
          />

          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-wide text-neutral-600">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <label htmlFor="signup-name" className="text-xs font-medium text-neutral-400 block mb-1.5">Full name</label>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                maxLength={60}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className={fieldCls}
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="text-xs font-medium text-neutral-400 block mb-1.5">Email</label>
              <input
                id="signup-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className={fieldCls}
              />
            </div>

            <div>
              <PasswordInput
                id="signup-password"
                name="new-password"
                label="Password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                describedBy="signup-password-rules"
                invalid={password.length > 0 && !policy.passed}
              />
              <PasswordStrength id="signup-password-rules" result={policy} />
            </div>

            <div>
              <PasswordInput
                id="signup-confirm"
                name="confirm-password"
                label="Confirm password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                invalid={mismatch}
              />
              {mismatch && <p className="mt-1.5 text-[11px] text-red-400">Passwords don't match.</p>}
            </div>

            <div aria-live="polite">
              {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={busy || googleBusy || !canSubmit}
              className="w-full text-sm font-medium px-4 py-2.5 rounded-lg text-white transition disabled:opacity-40 bg-indigo-500 hover:bg-indigo-400"
            >
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-5">
          Already have an account? <Link to="/login" className="text-indigo-300 hover:text-indigo-200">Log in</Link>
        </p>
      </div>
    </div>
  );
}
