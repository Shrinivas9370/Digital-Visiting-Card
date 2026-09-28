// Single place to tweak the password schema and email rules.
// NOTE: this is client-side UX only. Real enforcement must also happen
// server-side — turn on Firebase Auth's password policy in the console
// (Authentication → Settings → Password policy) with the same rules.

export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
};

// Tiny deny-list of the passwords attackers try first. Not exhaustive —
// Firebase/Identity Platform and breach-check services do the heavy lifting.
const COMMON_PASSWORDS = new Set([
  "password", "password1", "password123", "passw0rd", "p@ssw0rd", "p@ssword1",
  "12345678", "123456789", "1234567890", "qwerty123", "qwertyuiop", "qwerty12",
  "iloveyou", "admin123", "welcome1", "welcome123", "letmein123", "abc12345",
  "abcd1234", "11111111", "00000000", "asdfghjkl", "changeme", "monkey123",
]);

export const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export const normalizeName = (name) => String(name || "").trim().replace(/\s+/g, " ");

function containsPersonalInfo(password, { email, name } = {}) {
  const pw = password.toLowerCase();
  const tokens = [];
  const local = normalizeEmail(email).split("@")[0];
  if (local) tokens.push(local);
  normalizeName(name)
    .toLowerCase()
    .split(" ")
    .forEach((part) => tokens.push(part));
  // Ignore very short tokens — "al" or "jo" would flag too many good passwords.
  return tokens.some((t) => t.length >= 3 && pw.includes(t));
}

const RULES = [
  { id: "length", label: `At least ${PASSWORD_POLICY.minLength} characters`, test: (pw) => pw.length >= PASSWORD_POLICY.minLength },
  { id: "upper", label: "One uppercase letter (A–Z)", test: (pw) => /[A-Z]/.test(pw) },
  { id: "lower", label: "One lowercase letter (a–z)", test: (pw) => /[a-z]/.test(pw) },
  { id: "digit", label: "One number (0–9)", test: (pw) => /[0-9]/.test(pw) },
  { id: "special", label: "One special character (!@#$%…)", test: (pw) => /[^A-Za-z0-9\s]/.test(pw) },
  { id: "space", label: "No spaces", test: (pw) => !/\s/.test(pw) },
  { id: "common", label: "Not a commonly used password", test: (pw) => pw.length > 0 && !COMMON_PASSWORDS.has(pw.toLowerCase()) },
  { id: "personal", label: "Doesn't contain your name or email", test: (pw, ctx) => pw.length > 0 && !containsPersonalInfo(pw, ctx) },
];

// Returns { rules: [{id,label,passed}], passed, level (0-4), levelLabel }
export function checkPassword(password, ctx = {}) {
  const pw = String(password || "");
  const rules = RULES.map((r) => ({ id: r.id, label: r.label, passed: r.test(pw, ctx) }));
  const passedCount = rules.filter((r) => r.passed).length;
  const passed = rules.every((r) => r.passed) && pw.length <= PASSWORD_POLICY.maxLength;

  let level = 0;
  if (pw.length > 0) {
    if (passed) level = pw.length >= 12 ? 4 : 3;
    else level = passedCount >= rules.length - 2 ? 2 : 1;
  }
  const levelLabel = ["", "Weak", "Fair", "Good", "Strong"][level];
  return { rules, passed, level, levelLabel };
}
