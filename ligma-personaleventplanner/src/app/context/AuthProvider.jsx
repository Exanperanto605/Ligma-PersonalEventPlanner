"use client";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from "react";
import { auth, googleAuthProvider, db } from './firebaseConfig.js';
import { doc, getDoc } from "firebase/firestore";
import { UserAuthContext } from './auth-context';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    const signUpWithEmailPW = async (email, password) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, username, dateOfBirth, password);
            const u = auth.currentUser || result.user;
            const normalized = normalizeUser(u);
            setUser(normalized);
            return result;
        } catch (error) {
            console.error(`Sign-up error: ${error}`);
            throw error;
        }
    };

    const signInWithEmailPW = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            try { await result.user?.reload(); } catch (_) { /* ignore */ }
            const u = auth.currentUser || result.user;
            const normalized = normalizeUser(u);
            setUser(normalized);
            await verify2FA(normalized);
            return result;
        } catch (error) {
            console.error(`Sign-in error: ${error}`);
            try { router.push('/401'); } catch(e) { /* ignore */ } // Placeholder
            throw error;
        }
    };
    
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleAuthProvider);
            try { await result.user?.reload(); } catch (_) { /* ignore */ }
            const u = auth.currentUser || result.user;
            const normalized = normalizeUser(u);
            setUser(normalized);
            await verify2FA(normalized);
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

    // 2FA Redirect
    async function verify2FA(user) {
        if (!user?.uid) return;

        try {
            const ref = doc(db, "users", user.uid);
            const snap = await getDoc(ref);

            if (snap.exists()) {
                if (snap.data().is2FAEnabled) {
                    // Redirect the user to 2FA verification page.
                    router.push("/auth/verify-2fa");
                }
            }
        } catch (error) {
            console.error(`2FA checking error: ${error}`);
        }
    }

    // Normalize User
    function normalizeUser(u) {
        if (!u) return null;
        return {
            uid: u?.uid,
            email: u?.email,
            displayName: u?.displayName || u?.providerData?.[0]?.displayName || u?.email || "",
            photoURL: u?.photoURL || u?.providerData?.[0]?.photoURL || "",
            providerData: u?.providerData || [],
        };
    }

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
        <UserAuthContext.Provider value={{ user, signUpWithEmailPW, signInWithEmailPW, signInWithGoogle, signOut }}>{children}</UserAuthContext.Provider>
    );
}
