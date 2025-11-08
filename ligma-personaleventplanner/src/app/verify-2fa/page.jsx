"use client";

import { useState } from "react";
import { auth } from "../context/firebaseConfig";
import { useRouter } from "next/navigation";
import styles from "./styles/2fa_style.module.css"

export default function Verify2FA() {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    async function verifyCode() {
        const user = auth.currentUser;
        const res = await fetch("/api/2fa/verify", {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({ uid: user?.uid, token: code })
        });

        const data = await res.json();

        if (data.success) {
            router.replace('/calendar/view');
        }
        else {
            setError("Invalid code. Please try again.");
        }
    }

    return (
            <div>
                { (
                    <div className={styles.container}>
                        <div className={styles.card}>
                            <h1 className={styles.nameh1}>Two-Factor Authentication</h1>
                            <div className={styles.subtitle}>
                                This account has a two-factor authentication system enabled.
                                <br/><br/>
                                Please enter the 6-digit code from your authenticator app.
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                            <form onSubmit={verifyCode}>
                                <div className={styles.inputgroup}>
                                    <input 
                                    id="twoFAcode" 
                                    placeholder="XXXXXX" 
                                    value={code}
                                    maxLength={6}
                                    onChange={(e) => setCode(e.target.value)}
                                    required/>
                                </div>
    
                                <button className={styles.submit2FACode} type="submit" onClick={verifyCode}>Submit</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
}
