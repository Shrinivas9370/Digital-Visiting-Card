import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./Icons";

const inputCls =
  "w-full rounded-lg bg-white/[0.04] border border-white/10 pl-3 pr-10 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400/40 transition";

// Password field with a show/hide toggle.
// - `autoComplete` should be "current-password" on login and "new-password"
//   on signup / change-password so password managers behave correctly.
export default function PasswordInput({
  id,
  name,
  label,
  value,
  onChange,
  autoComplete,
  placeholder = "••••••••",
  required = true,
  maxLength = 128,
  describedBy,
  invalid = false,
}) {
  const [visible, setVisible] = useState(false);
  const [capsOn, setCapsOn] = useState(false);

  // Autofill can fire key events without getModifierState, hence the guard.
  const trackCaps = (e) => setCapsOn(Boolean(e.getModifierState?.("CapsLock")));

  return (
    <div>
      {label && (
        <label htmlFor={id} className="text-xs font-medium text-neutral-400 block mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          name={name || id}
          type={visible ? "text" : "password"}
          required={required}
          value={value}
          onChange={onChange}
          onKeyDown={trackCaps}
          onKeyUp={trackCaps}
          onBlur={() => setCapsOn(false)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          maxLength={maxLength}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={inputCls}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 px-3 flex items-center text-neutral-500 hover:text-neutral-200 focus:outline-none focus-visible:text-indigo-300 transition"
        >
          {visible ? <EyeOffIcon width={16} height={16} /> : <EyeIcon width={16} height={16} />}
        </button>
      </div>
      {capsOn && <p className="mt-1.5 text-[11px] text-amber-400">Caps Lock is on.</p>}
    </div>
  );
}
