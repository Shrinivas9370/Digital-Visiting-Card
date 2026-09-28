import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../data/AuthContext";
import { friendlyAuthError } from "../utils/authErrors";
import { isValidEmail, normalizeEmail } from "../utils/authValidation";
import { CardStackIcon } from "../components/Icons";
import PasswordInput from "../components/PasswordInput";
import GoogleButton from "../components/GoogleButton";

// Client-side cool-down after repeated failures. This is a UX speed bump only;
// Firebase enforces the real server-side throttling (auth/too-many-requests).
const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 30;

export default function Login() {
  const { user, login, resetPassword } = useAuth();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lockedUntil) return undefined;
    const timer = setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (t >= lockedUntil) setLockedUntil(0);
    }, 500);
    return () => clearInterval(timer);
  }, [lockedUntil]);

  const secondsLeft = lockedUntil ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;
  const locked = secondsLeft > 0;

  // Already signed in (or just signed in) → go where they were headed.
  if (user) return <Navigate to={location.state?.from?.pathname || "/"} replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (locked) return;
    setError("");
    setInfo("");

    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      setError("That email address looks invalid.");
      return;
    }

    setBusy(true);
    try {
      await login(cleanEmail, password);
      // <Navigate> above takes over once the auth state updates.
    } catch (err) {
      setError(friendlyAuthError(err));
      setPassword("");
      const next = attempts + 1;
      if (next >= MAX_ATTEMPTS) {
        setAttempts(0);
        setNow(Date.now());
        setLockedUntil(Date.now() + LOCK_SECONDS * 1000);
      } else {
        setAttempts(next);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    setError("");
    setInfo("");
    const cleanEmail = normalizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      setError("Enter your email above first, then choose “Forgot password?”.");
      return;
    }
    setResetBusy(true);
    try {
      await resetPassword(cleanEmail);
    } catch (err) {
      // Unknown emails are treated exactly like known ones so this form can't
      // be used to discover who has an account.
      if (!String(err?.code || "").includes("user-not-found")) {
        setError(friendlyAuthError(err));
        setResetBusy(false);
        return;
      }
    }
    setInfo(`If an account exists for ${cleanEmail}, a password reset link is on its way.`);
    setResetBusy(false);
  };

  const anyBusy = busy || googleBusy || resetBusy;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-neutral-100 flex items-center justify-center px-4">
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
          <h1 className="text-lg font-semibold text-white mb-1">Log in</h1>
          <p className="text-xs text-neutral-500 mb-5">Access your team's card dashboard.</p>

          <GoogleButton
            disabled={busy || resetBusy}
            emailHint={isValidEmail(normalizeEmail(email)) ? email : ""}
            onError={(msg) => {
              setError(msg);
              if (msg) setInfo("");
            }}
            onBusyChange={setGoogleBusy}
          />

          <div className="flex items-center gap-3 my-4">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-wide text-neutral-600">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            <div>
              <label htmlFor="login-email" className="text-xs font-medium text-neutral-400 block mb-1.5">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@business.com"
                className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40 transition"
              />
            </div>

            <div>
              <PasswordInput
                id="login-password"
                name="password"
                label="Password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div className="mt-1.5 text-right">
                <button
                  type="button"
                  onClick={handleForgot}
                  disabled={anyBusy}
                  className="text-[11px] text-indigo-300 hover:text-indigo-200 disabled:opacity-40 transition"
                >
                  {resetBusy ? "Sending…" : "Forgot password?"}
                </button>
              </div>
            </div>

            <div aria-live="polite">
              {error && <p role="alert" className="text-xs text-red-400">{error}</p>}
              {info && <p className="text-xs text-emerald-400">{info}</p>}
              {locked && (
                <p className="text-xs text-amber-400">Too many failed attempts. Try again in {secondsLeft}s.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={anyBusy || locked || !email || !password}
              className="w-full text-sm font-medium px-4 py-2.5 rounded-lg text-white transition disabled:opacity-40 bg-indigo-500 hover:bg-indigo-400"
            >
              {busy ? "Logging in…" : "Log in"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-neutral-500 mt-5">
          Don't have an account? <Link to="/signup" className="text-indigo-300 hover:text-indigo-200">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
