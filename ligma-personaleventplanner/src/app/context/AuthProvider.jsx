"use client";

import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from "react";
import { auth, googleAuthProvider } from './firebaseConfig.js';
import { UserAuthContext } from './auth-context';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleAuthProvider);
            setUser(result.user);
            return result;
        } catch (error) {
            console.error(`Sign-in error: ${error}`);
            // client-side navigation to an unauthorized page (optional)
            try { router.push('/401'); } catch(e) { /* ignore */ }
            throw error;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserAuthContext.Provider value={{ user, signInWithGoogle, signOut }}>{children}</UserAuthContext.Provider>
    );
}
