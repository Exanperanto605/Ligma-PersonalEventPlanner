import { useContext, useState } from "react";
import { UserAuthContext } from "../../context/auth-context";
import { db } from "../../context/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

function CreateNewAccount() {
    const { signUpWithEmailPW } = useContext(UserAuthContext);
    const router = useRouter();
    
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");

    const handleSignUpWithEmailPW = async (e) => {
        e.preventDefault();
        try {
            const userCred = signUpWithEmailPW(email, username, dateOfBirth, password);
            router.push('/calendar/view')
        } catch (err) {
            console.error('Sign-up failed', err);
        }
    }

    const handleBrithdateChange = (e) => {
        const value = e.target.value;

        if (!isValidBirthdateFormat(value)) {
            setError("Please enter a valid date in DD/MM/YYYY format.");
            return;
        }

        if (/^[0-9/]*$/.test(value)) {
            setDateOfBirth(value);
        }
    }

    // Date Format Thing
    const isValidBirthdateFormat = (dateStr) => {
        // Must be in 'DD/MM/YYYY' format
        const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!match) return false;

        const day = parseInt(match[1]);
        const month = parseInt(match[2]);
        const year = parseInt(match[3]);

        const date = new Date(year, month - 1, day);
        return (
            date.getFullYear() === year &&
            date.getMonth() === month - 1 &&
            date.getDate() === day
        );
    }
    
    return (
        // HTML Markup
    );
}
