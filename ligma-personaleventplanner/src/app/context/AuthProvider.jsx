"use client";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from "react";
import { auth, googleAuthProvider, db } from './firebaseConfig.js';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserAuthContext } from './auth-context';
import { useRouter } from 'next/navigation';

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    const signUpWithEmailPW = async (email, username, dateOfBirth, password) => {
        try {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            const u = auth.currentUser || result.user;

            const formattedDate = new Date(dateOfBirth).toISOString().split("T")[0];

            await setDoc(doc(db, "userInfo", u.uid), {
                email,
                username,
                dateOfBirth: formattedDate,
                createAt: new Date(),
                provider: "email",
                is2FAEnabled: false
            });

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
            // 2FA disabled; no verification/redirect
            return result;
        } catch (error) {
            console.error(`Sign-in error: ${error}`);
            // หาก credential ไม่ถูกต้อง ให้อยู่หน้าเดิม แต่ถ้า error อื่นให้พาไป /401
            if (error.code !== "auth/invalid-credential") {
                try { router.push('/401'); } catch (_) { /* ignore */ }
            }
            throw error;
        }
    };
    
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleAuthProvider);
            try { await result.user?.reload(); } catch (_) { /* ignore */ }
            const u = auth.currentUser || result.user;

            const userSnap = await getDoc(doc(db, "userInfo", u.uid));

            if (!userSnap.exists()) {
                console.log("New Google User: ", u.uid);
                await setDoc(doc(db, "userInfo", u.uid), {
                    email: u.email,
                    username: u.displayName,
                    dateOfBirth: null,
                    createAt: new Date(),
                    provider: "Google",
                    is2FAEnabled: false
                });
            }

            const normalized = normalizeUser(u);
            setUser(normalized);
            // 2FA disabled; no verification/redirect
            return result;
        } catch (error) {
            console.error(`Sign-in error: ${error}`);
            try { router.push('/401'); } catch (_) { /* ignore */ }
            throw error;
        }
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setUser(null);
    };

    // 2FA disabled: no-op
    async function verify2FA() { return; }

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
