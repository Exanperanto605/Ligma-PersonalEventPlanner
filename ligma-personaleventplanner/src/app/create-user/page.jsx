"use client";

import { useContext, useState } from "react";
import { UserAuthContext } from "../context/auth-context";
import AuthProvider from "../context/AuthProvider";
import { useRouter } from "next/navigation";
import styles from "../styles/create-user_style.module.css";

function CreateNewAccount() {
    const { signUpWithEmailPW } = useContext(UserAuthContext);
    const router = useRouter();
    
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");

    const handleSignUpWithEmailPW = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match. Please try again.");
            return;
        }

        try {
            await signUpWithEmailPW(email, username, dateOfBirth, password);
            router.push('/calendar/view')
        } catch (err) {
            console.error('Sign-up failed', err);
        }
    }

    const handleBirthdateChange = (e) => {
        const value = e.target.value;
        setDateOfBirth(value);

        if (isValidBirthdateFormat(value)) {
            setError("");
        }
        else {
            setError("Please enter a valid date in YYYY-MM-DD format.");
        }
    }

    // Date Format Thing
    const isValidBirthdateFormat = (dateStr) => {
        // Must be in 'YYYY-MM-DD' format
        if (typeof dateStr !== "string") return false;

        const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!match) return false;

        const [_, year, month, day] = match;

        const date = new Date(+year, +month - 1, +day);
        return (
            date.getFullYear() === +year &&
            date.getMonth() === +month - 1 &&
            date.getDate() === +day
        );
    }
    
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.titlecard}>
                    <h1 className={styles.nameh1}>Create your account</h1>
                </div>
                <form onSubmit={handleSignUpWithEmailPW}>
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

                    <div className={styles.inputgroup}>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="username"
                        placeholder="JohnDoe123"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    </div>

                    <div className={styles.inputgroup}>
                    <label htmlFor="username">Birth Date</label>
                    <input
                        id="birthdate"
                        type="text"
                        placeholder="YYYY-MM-DD"
                        value={dateOfBirth}
                        onChange={handleBirthdateChange}
                        maxLength={10}
                        required
                    />
                    </div>
                    <p className={"text-xs text-red-500"}>{error ? `${error}` : ""}</p>

                    <div className={styles.inputgroup}>
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    </div>

                    <div className={styles.inputgroup}>
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    </div>

                    <p className={`text-xs ${password === confirmPassword ? "text-lime-600" : "text-red-600"}`}>
                        {(!password || !confirmPassword) ? "" : ((password === confirmPassword) ? "Passwords match. All good! :)" : "Both passwords must match. :(")}
                    </p>
                    <button className={styles.submit} type="submit" onClick={handleSignUpWithEmailPW}>
                    Submit
                    </button>

                    <div className={styles.links}>
                    <a href="/">Already have an account?</a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CreateUserPage() {
    return (
        <AuthProvider><CreateNewAccount /></AuthProvider>
    )
}
