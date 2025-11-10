"use client";

import { auth } from "../context/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from 'react';
import styles from "../styles/forget-pw_style.module.css"

export default function forgetPassword() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("A password reset email has been sent! Please check your inbox!")
        } catch (err) {
            if (err.code === "auth/user-not-found") {
                setError("No account is found with this email. Please try again.");
            }
            else if (err.code === "auth/invalid-email") {
                setError("This email is invalid. Please type in the valid email.");
            }
            else {
                setError("Soemthing went wrong. Please try again later.")
            }
            console.error(err); // DEBUG
        }
    }

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.nameh1}>Reset your password</h1>
                <p className={styles.subtitle}>Submit your email address linked to your account to receive the password reset email.</p>
                <form onSubmit={handlePasswordReset}>
                    <div className={styles.inputgroup}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="something@email.smth"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <p className={error && !message ? "text-xs text-red-500" : "text-xs text-lime-500"}>
                    {error ? `${error}` : (message ? `${message}`: "")}
                    </p>

                    <button
                    className={styles.submit}
                    type="submit"
                    onClick={handlePasswordReset}
                    >
                    Submit
                    </button>

                    <div className={styles.links}>
                    <a href="/">← Back to Log In</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
