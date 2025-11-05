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
            try { await result.user?.reload(); } catch (_) { /* ignore */ }
            const u = auth.currentUser || result.user;
            const normalized = {
                uid: u?.uid,
                email: u?.email,
                displayName: u?.displayName || u?.providerData?.[0]?.displayName || u?.email || "",
                photoURL: u?.photoURL || u?.providerData?.[0]?.photoURL || "",
                providerData: u?.providerData || [],
            };
            setUser(normalized);
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
        // E2E test bypass: when NEXT_PUBLIC_E2E_TEST=1 and localStorage flag set
        try {
            if (process.env.NEXT_PUBLIC_E2E_TEST === '1' && typeof window !== 'undefined' && window.localStorage?.getItem('e2e_login') === '1') {
                setUser({ uid: 'e2e-uid', email: 'e2e@example.com', displayName: 'E2E User', photoURL: '', providerData: [] });
                return;
            }
        } catch (_) { /* ignore */ }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (!currentUser) { setUser(null); return; }
            try { await currentUser.reload(); } catch (_) { /* ignore */ }
            const u = auth.currentUser || currentUser;
            const normalized = {
                uid: u?.uid,
                email: u?.email,
                displayName: u?.displayName || u?.providerData?.[0]?.displayName || u?.email || "",
                photoURL: u?.photoURL || u?.providerData?.[0]?.photoURL || "",
                providerData: u?.providerData || [],
            };
            setUser(normalized);
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserAuthContext.Provider value={{ user, signInWithGoogle, signOut }}>{children}</UserAuthContext.Provider>
    );
}
