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
                <button onClick={signInWithGoogle} style={{ width: "100%", marginTop: "10px", background: "#4285f4", border: "none", borderRadius: "12px", color: "white",
                        fontSize: "15px", fontWeight: "600", padding: "12px 0", cursor: "pointer",
                        transition: "background 0.2s ease"}}>Sign In With Google</button>
            )}
        </div>
    )
}

export default function AuthPage() {
    return (
        <div style={{
            margin: 0,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(180deg, #333333 0%, #1c1c1c 100%)",
            color: "#e2e8f0"
        }}>
            <div style={{
                background: "#1c1c1c",
                padding: "40px 36px",
                borderRadius: "12px",
                width: "360px",
                textAlign: "center"
            }}>
                <h1 style={{ fontSize: "45px", margin: 0 }}>Ligma</h1>
                <div style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "28px"}}>Your Personal Event Planner</div>
                <form>
                    <div style={{ textAlign: "left", marginBottom: "16px" }}>
                        <label for="email">Email</label>
                        <input id="email" type="email" placeholder="something@email.smth" required />
                    </div>

                    <div style={{ textAlign: "left", marginBottom: "16px" }}>
                        <label for="password">Password</label>
                        <input id="password" type="password" placeholder="Password" required />
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", marginBottom: "24px" }}>
                        <a href="#">Forgot password?</a>
                        <a href="#">Register</a>
                    </div>

                    <button style={{ width: "100%", background: "#2c2c2c", border: "none", borderRadius: "12px", color: "white",
                        fontSize: "15px", fontWeight: "600", padding: "12px 0", cursor: "pointer",
                        transition: "background 0.2s ease"}} type="submit">Sign In</button>
                </form>
                <AuthProvider><AuthContent /></AuthProvider>
            </div>
        </div>
    )
}
