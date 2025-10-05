import React from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useContext, createContext, useState, useEffect } from "react";
import { auth, googleAuthProvider } from '../firebaseConfig';
// import { unauthorized } from 'next/navigation'

const UserAuthContext = createContext();

export const UserAuth = ({ children }) => {
    const [user, setUser] = useState(null);

    const loginWithGoogle = async () => {
        const googleAuthProvider = new GoogleAuthProvider();
        signInWithPopup(auth, googleAuthProvider);
    };

    const logout = () => {
        signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currectUser) => {
            setUser(currectUser);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <UserAuthContext.Provider value={{ user, loginWithGoogle, logout }}>{children}</UserAuthContext.Provider>
    );
};
