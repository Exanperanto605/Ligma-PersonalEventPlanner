"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthProvider from "./context/AuthProvider";
// import { UserAuthContext } from "./context/auth-context"; <- Real
import { UserAuthContext } from "./context/auth-context copy";
import styles from "./styles/auth_style.module.css";

function AuthContent() {
    const { user, signInWithEmailPW, signInWithGoogle, signOut } = useContext(UserAuthContext);
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    // If user is authenticated, navigate to dashboard after render
    useEffect(() => {
        if (user) {
            try { router.replace('/calendar/view'); } catch (e) { /* ignore */ }
        }
    }, [user, router]);

    if (user) return <div>Redirecting to dashboard...</div>;

    const handleEmailSignIn = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailPW(email, password);
            router.push('/calendar/view');
        } catch (err) {
            if (err == "Placeholder - 2FA Verification needed message thing") {
                router.push('/auth/verify-2fa');
            }
            else {
                console.error('Email + PW sign-in failed', err);
            }
        }
    }

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
            router.push('/calendar/view');
        } catch (err) {
            console.error('Google sign-in failed', err);
        }
    };

    return (
        <div>
            { user ? (
                <>
                    <div>
                        <button onClick={signOut}>Sign Out</button>
                        <a style={{ marginLeft: 12 }} href="/calendar/view">Open Dashboard</a>
                    </div>
                </>
            ) : (
                <div className={styles.container}>
                    <div className={styles.card}>
                        <h1 className={styles.nameh1}>Ligma</h1>
                        <div className={styles.subtitle}>Your Personal Event Planner</div>
                        <form onSubmit={handleEmailSignIn}>
                            <div className={styles.inputgroup}>
                                <label htmlFor="email">Email</label>
                                <input id="email" type="email" placeholder="something@email.smth" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required/>
                            </div>

                            <div className={styles.inputgroup}>
                                <label htmlFor="password">Password</label>
                                <input id="password" type="password" placeholder="Password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required />
                            </div>

                            <div className={styles.links}>
                                <a href="/forgot-password">Forgot password?</a>
                                <a href="/register">Register</a>
                            </div>

                            <button className={styles.submitEmail} type="submit">Sign In</button>
                        </form>
                        <button onClick={handleGoogleSignIn} className={styles.signInGoogle}>Sign In With Google</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AuthPage() {
    return (
        <AuthProvider><AuthContent /></AuthProvider>
    )
}
