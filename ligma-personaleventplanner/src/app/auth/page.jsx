import { useContext } from "react";
import AuthProvider from "../context/AuthProvider";
import { UserAuthContext } from "../context/auth-context";

function AuthContent() {
    const { user, signInWithGoogle, signOut } = useContext(UserAuthContext);

    return (
        <div>
            { user ? (
                <>
                    <button onClick={signOut}>Sign Out</button>
                </>
            ) : (
                <button onClick={signInWithGoogle}>Sign in with Google</button>
            )}
        </div>
    )
}

export default function AuthPage() {
    return (
        <AuthProvider>
            <AuthContent />
        </AuthProvider>
    )
}
