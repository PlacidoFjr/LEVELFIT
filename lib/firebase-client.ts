"use client";

import { initializeApp, getApps } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  browserLocalPersistence,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile,
  type User,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function isFirebaseConfigured() {
  return Object.values(firebaseConfig).every(Boolean);
}

function requireFirebaseAuth() {
  if (!isFirebaseConfigured()) throw new Error("Firebase Auth nao configurado.");
  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  const auth = getAuth(app);
  auth.languageCode = "pt-BR";
  return auth;
}

export async function signInFirebaseWithEmail(email: string, password: string) {
  const auth = requireFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function createFirebaseUser(input: { email: string; password: string; displayName: string }) {
  const auth = requireFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
  await updateProfile(credential.user, { displayName: input.displayName });
  await sendEmailVerification(credential.user, {
    url: `${window.location.origin}/login?emailVerified=1`,
    handleCodeInApp: false,
  });
  return credential.user;
}

export async function sendFirebasePasswordReset(email: string) {
  const auth = requireFirebaseAuth();
  await sendPasswordResetEmail(auth, email, {
    url: `${window.location.origin}/login?passwordReset=1`,
    handleCodeInApp: false,
  });
}

export async function storedFirebaseIdToken() {
  const auth = requireFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
  const user = auth.currentUser ?? await new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      unsubscribe();
      resolve(nextUser);
    });
  });

  return user ? user.getIdToken() : null;
}

export async function firebaseIdToken(user: User) {
  return user.getIdToken(true);
}
