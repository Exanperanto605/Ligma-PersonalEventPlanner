import { createContext } from "react";

export const initialValue = {
    user: null,
    signUpWithEmailPW: () => {},
    signInWithEmailPW: () => {},
    signInWithGoogle: () => {},
    signOut: () => {},
};

export const UserAuthContext = createContext(initialValue);
