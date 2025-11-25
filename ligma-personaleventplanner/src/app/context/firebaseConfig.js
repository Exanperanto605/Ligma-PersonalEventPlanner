import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ใช้ค่าคงที่ตรงจาก Firebase console เพื่อให้แน่ใจว่า key ถูกต้อง (หลีกเลี่ยงปัญหา env ไม่ถูกอ่าน)
const firebaseConfig = {
    apiKey: "AIzaSyATu0GiahKhqmpyTaxUo1uSqsO0DppghGg",
    authDomain: "ligma-personaleventplanner.firebaseapp.com",
    projectId: "ligma-personaleventplanner",
    storageBucket: "ligma-personaleventplanner.firebasestorage.app",
    messagingSenderId: "66250269201",
    appId: "1:66250269201:web:c13ce91a58ae0d50f647b0",
    measurementId: "G-82BB3BME5H"
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
