import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from "react";
import { auth, googleAuthProvider } from '../firebaseConfig';
import { UserAuthContext } from './auth-context';
import { redirect, RedirectType } from 'next/navigation'

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleAuthProvider);
            setUser(result.user);
        } catch (error) {
            console.error(`Sign-in error: ${error}`);
            redirect('/placeholder401Page', RedirectType.replace); // Redirect to 401
                                                                   // -> change `placeholder401Page` to the dedicated 401 page
        }
    };

    const logOut = async () => {
        await signOut(auth);
        setUser(null);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currectUser) => {
            setUser(currectUser);
        });

        return () => unsubscribe();
    }, [user]);

    return (
        <UserAuthContext.Provider value={{ user, signInWithGoogle, logOut }}>{children}</UserAuthContext.Provider>
    );
}
