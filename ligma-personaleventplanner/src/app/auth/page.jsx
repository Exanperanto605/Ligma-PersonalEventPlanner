import { useContext } from "react";
import AuthProvider from "../context/AuthProvider";
import { UserAuthContext } from "../context/auth-context";
import styles from "./styles/auth_style.module.css";

function AuthContent() {
    const { user, signInWithGoogle, signOut } = useContext(UserAuthContext);

    return (
        <div>
            { user ? (
                <>
                    <button onClick={signOut}>Sign Out</button>
                </>
            ) : (
                <button onClick={signInWithGoogle} className={styles.signInGoogle}>Sign In With Google</button>
            )}
        </div>
    )
}

export default function AuthPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card} style={{
                background: "#1c1c1c",
                padding: "40px 36px",
                borderRadius: "12px",
                width: "360px",
                textAlign: "center"
            }}>
                <h1>Ligma</h1>
                <div className={styles.subtitle}>Your Personal Event Planner</div>
                <form>
                    <div className={styles.input-group}>
                        <label for="email">Email</label>
                        <input id="email" type="email" placeholder="something@email.smth" required />
                    </div>

                    <div className={styles.input-group}>
                        <label for="password">Password</label>
                        <input id="password" type="password" placeholder="Password" required />
                    </div>

                    <div className={styles.links}>
                        <a href="#">Forgot password?</a>
                        <a href="#">Register</a>
                    </div>

                    <button className={styles.submitEmail} type="submit">Sign In</button>
                </form>
                <AuthProvider><AuthContent /></AuthProvider>
            </div>
        </div>
    )
}
