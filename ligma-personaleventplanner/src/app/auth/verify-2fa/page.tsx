"use client";

import { useState } from "react";
import { auth } from "../../context/firebaseConfig";
import { useRouter } from "next/navigation";

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
        // HTML Markup
    );
}
