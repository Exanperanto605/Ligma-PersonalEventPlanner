"use client";

import { auth } from "../context/firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from "./styles/forget-pw_style.module.css"

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
                console.error(`Error: ${err}`);
            }
        }
    }

    return (
        // HTML Markup
    );
}
