import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../firebaseConfig';
import { unauthorized } from 'next/navigation'

function App() {
    const loginWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleAuthProvider);
            const user = result.user;
            alert(`Welcome ${user.displayName}`);   // Placeholder
        } catch (error) {
            // alert(error.message);   // Placeholder
            unauthorized();     // Redirect to 401 -> Error Page is customizable via `unauthorized.js` file.
        }
    };

    return {
        // Login UI WIP
    }
}

export default App;
