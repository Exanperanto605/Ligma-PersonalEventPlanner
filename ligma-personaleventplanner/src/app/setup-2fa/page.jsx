"use client";

import { useEffect, useState } from "react";
import { auth } from "../context/firebaseConfig";

export default function Setup2FA() {
    const [qr, setQr] = useState("");
    const [code, setCode] = useState("");
    const [verified, setVerified] = useState(false);

    async function generate() {
        const user = auth.currentUser;
        const res = await fetch("../../api/2fa/setup", {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({ uid: user?.uid, email: user?.email })
        });

        const data = await res.json();
        setQr(data.qrCodeDataURL);
    }

    async function verify() {
        const user = auth.currentUser;
        const res = await fetch("../../api/2fa/verify", {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({ uid: user?.uid, email: user?.email })
        });

        const data = await res.json();
        setVerified(data.success);
    }

    useEffect(() => {
        setup2FA();
    }, []);

    return (
        // HTML Markup
    );
}
