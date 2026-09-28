import { checkPassword } from "../utils/authValidation";

const LEVEL_STYLE = {
  1: { bar: "bg-red-400", text: "text-red-400" },
  2: { bar: "bg-amber-400", text: "text-amber-400" },
  3: { bar: "bg-lime-400", text: "text-lime-400" },
  4: { bar: "bg-emerald-400", text: "text-emerald-400" },
};

// Live strength meter + requirements checklist. Pass `result` from
// checkPassword() so the parent and this component share one evaluation.
export default function PasswordStrength({ password, result, id }) {
  const r = result || checkPassword(password);
  const style = LEVEL_STYLE[r.level];

  return (
    <div id={id} className="mt-2.5" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1" aria-hidden="true">
          {[1, 2, 3, 4].map((seg) => (
            <span
              key={seg}
              className={`h-1 flex-1 rounded-full transition-colors ${
                style && r.level >= seg ? style.bar : "bg-white/10"
              }`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-medium w-12 text-right ${style ? style.text : "text-neutral-600"}`}>
          {r.levelLabel || "—"}
        </span>
      </div>

      <ul className="mt-2.5 grid grid-cols-1 gap-1">
        {r.rules.map((rule) => (
          <li
            key={rule.id}
            className={`flex items-center gap-2 text-[11px] transition-colors ${
              rule.passed ? "text-emerald-400" : "text-neutral-500"
            }`}
          >
            <span aria-hidden="true" className="w-3 text-center">{rule.passed ? "✓" : "•"}</span>
            <span>
              {rule.label}
              <span className="sr-only">{rule.passed ? " — met" : " — not met"}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
