import { createContext } from "react";

export const initialValue = {
    user: null,
    signInWithGoogle: () => {},
    signOut: () => {},
};

export const UserAuthContext = createContext(initialValue);
