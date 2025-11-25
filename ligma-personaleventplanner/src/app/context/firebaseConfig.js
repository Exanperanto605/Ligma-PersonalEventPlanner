import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyATu0GiahKhqmpyTaxUo1uSqsO0DppghGg",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "ligma-personaleventplanner.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "ligma-personaleventplanner",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "ligma-personaleventplanner.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "66250269201",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:66250269201:web:c13ce91a58ae0d50f647b0",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-82BB3BME5H"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);

const googleAuthProvider = new GoogleAuthProvider();
// Ensure we receive basic profile info including photoURL
googleAuthProvider.addScope('profile');
googleAuthProvider.addScope('email');
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, googleAuthProvider };
export const db = getFirestore(app);
