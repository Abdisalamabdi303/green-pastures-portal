// Firebase configuration and setup
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration object
// NOTE: These are client-side keys that are meant to be public.
// Firebase security is based on server-side security rules, not API key secrecy.
// These keys identify your project to Firebase, but access to your data is protected
// by Firebase Authentication and Security Rules, not by keeping these keys secret.
const firebaseConfig = {
  apiKey: "AIzaSyAV9pbVZez9KPiqyayjVfTsXgBF08b8V44",
  authDomain: "animal-inventory-1f83b.firebaseapp.com",
  projectId: "animal-inventory-1f83b",
  storageBucket: "animal-inventory-1f83b.firebasestorage.app",
  messagingSenderId: "523947693523",
  appId: "1:523947693523:web:17ea8353617fbc304a0b26",
  measurementId: "G-HT1ZYBYF1G"
};

console.log("Firebase being initialized with client-side configuration");

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
