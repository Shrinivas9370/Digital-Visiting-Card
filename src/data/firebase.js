import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Fail loudly (names only, never values) if an env var didn't make it into the
// build. On Vercel, .env is not uploaded, so these must be added under
// Project → Settings → Environment Variables and the site redeployed.
const REQUIRED = ["apiKey", "authDomain", "projectId", "appId"];
const missing = REQUIRED.filter((key) => !firebaseConfig[key]);
if (missing.length) {
  console.error(`Firebase config is missing: ${missing.join(", ")}. Check your VITE_FIREBASE_* environment variables.`);
}

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
