import React from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useContext, createContext, useState, useEffect } from "react";
import { auth } from '../firebaseConfig';
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

function displayUserInfo() {
    const currUser = useContext(UserAuthContext);

    useEffect(() => {
        const userId = currUser?.uid;
        const userName = currUser?.displayName;
        const userEmail = currUser?.email;
        const userPFP = currUser?.photoURL;

        console.log(`User ID: ${userId}`);
        console.log(`User Photo: ${userPFP}`);
        console.log(`Display Name: ${userName}`);
        console.log(`Email: ${userEmail}`);

        document.getElementById("userName").textContent = userName;
        document.getElementById("userProfilePicture").src = userPFP;
        document.getElementById("userEmail").textContent = userEmail;
    }, [currUser]);
    
    return null;
}
