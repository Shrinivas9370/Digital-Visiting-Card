import { createContext, useContext, useEffect, useReducer, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";
import { normalizeEmail, normalizeName } from "../utils/authValidation";

const AuthContext = createContext(null);

// `user` is `undefined` while Firebase is still checking the session on load,
// `null` once it's confirmed there's no one signed in, or a Firebase User.
//
// Passwords are never hashed or stored by this app: Firebase Auth sends them
// over TLS and stores only a salted, memory-hard hash (scrypt) server-side.
// Hashing on the client would turn the hash into the "real" password and add
// no security, so we don't.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [, rerender] = useReducer((n) => n + 1, 0);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  const signup = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, normalizeEmail(email), password);
    const displayName = normalizeName(name);
    if (displayName) await updateProfile(cred.user, { displayName });
    // Verification mail is best-effort — never block account creation on it.
    try {
      await sendEmailVerification(cred.user);
    } catch {
      /* the user can request another one later */
    }
    // updateProfile mutates the same User object in place, so the reference
    // doesn't change and React wouldn't notice. Force a re-render instead of
    // spreading the User into a plain object (which strips its methods).
    rerender();
    return cred.user;
  };

  const login = (email, password) => signInWithEmailAndPassword(auth, normalizeEmail(email), password);

  // Works for both login and signup: Firebase creates the account on first
  // sign-in and just signs the user in on every later one. A fresh provider is
  // built per call so `login_hint` can carry whatever the user already typed.
  const loginWithGoogle = async (emailHint = "") => {
    const provider = new GoogleAuthProvider();
    const params = { prompt: "select_account" };
    const hint = normalizeEmail(emailHint);
    if (hint) params.login_hint = hint;
    provider.setCustomParameters(params);
    const cred = await signInWithPopup(auth, provider);
    return cred.user;
  };

  const resetPassword = (email) => sendPasswordResetEmail(auth, normalizeEmail(email));

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, signup, login, loginWithGoogle, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an <AuthProvider>");
  return ctx;
}
