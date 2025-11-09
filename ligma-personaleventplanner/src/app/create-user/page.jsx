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

    const [emailError, setEmailError] = useState("");
    const [dateError, setdateError] = useState("");
    const [pwError, setPwError] = useState("");

    const handleSignUpWithEmailPW = async (e) => {
        e.preventDefault();
        setEmailError("");
        setPwError("");

        if (password !== confirmPassword) {
            setPwError("Both passwords must match. :(");
            return;
        }
        if (isStrongPW(password)) {
            setPwError("A password must be at least 8 characters long and include"<br>"uppercase and lowercase letters, numbers, and special characters.");
            return;
        }

        try {
            await signUpWithEmailPW(email, username, dateOfBirth, password);
            router.push('/calendar/view')
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                setEmailError("This email is already taken by an existing account.")
            }
            else if (err.code === "auth/invalid-email") {
                setEmailError("This email is invalid. Please type in the valid email.")
            }
            else {
                console.error('Sign-up failed', err);
            }
        }
    }

    const handleBirthdateChange = (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 4) { value = value.slice(0, 4) + "-" + value.slice(4); }
        if (value.length > 7) { value = value.slice(0, 7) + "-" + value.slice(7); }

        setDateOfBirth(value);

        if (isValidBirthdateFormat(value)) {
            setdateError("");
        }
        else {
            setdateError("Please enter a valid date in YYYY-MM-DD format.");
        }
    }

    const isStrongPW = (pw) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/;
        const hasLowerCase = /[a-z]/;
        const hasNumber = /\d/;
        const hasSpecChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

        return (
            pw.length >= minLength &&
            hasUpperCase.test(pw) &&
            hasLowerCase.test(pw) &&
            hasNumber.test(pw) &&
            hasSpecChar.test(pw)
        );
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

    // if (user) return <div>Redirecting to dashboard...</div>;
    
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
                    <p className={"text-xs text-red-500"}>{emailError ? `${emailError}` : ""}</p>

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
                    <p className={"text-xs text-red-500"}>{dateError ? `${dateError}` : ""}</p>

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
