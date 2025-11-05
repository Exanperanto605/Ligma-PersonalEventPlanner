import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyATu0GiahKhqmpyTaxUo1uSqsO0DppghGg",
    authDomain: "ligma-personaleventplanner.firebaseapp.com",
    projectId: "ligma-personaleventplanner",
    storageBucket: "ligma-personaleventplanner.firebasestorage.app",
    messagingSenderId: "66250269201",
    appId: "1:66250269201:web:c13ce91a58ae0d50f647b0",
    measurementId: "G-82BB3BME5H"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const googleAuthProvider = new GoogleAuthProvider();
// Ensure we receive basic profile info including photoURL
googleAuthProvider.addScope('profile');
googleAuthProvider.addScope('email');
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, googleAuthProvider };
