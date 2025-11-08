"use client";

import { useEffect, useState } from "react";
import { auth } from "../context/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../context/firebaseConfig";
import { useRouter } from "next/navigation"; 
import styles from "./styles/2fa_style.module.css"

export default function Setup2FA() {
    const [qr, setQr] = useState("");
    const [code, setCode] = useState("");
    const [success, setSuccess] = useState(false);

    const router = useRouter();

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
        const res = await fetch("../../api/2fa/setup", {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({ uid: user?.uid, email: user?.email })
        });

        const data = await res.json();
        setSuccess(data.success);

        const userRef = doc(db, "userInfo", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            await updateDoc(userRef, {
                is2FAEnabled: true
            });
        }

        if (success) {
            router.push("/calendar/view")
        }
    }

    useEffect(() => {
        setup2FA();
    }, []);

    return (
        <div className={styles.container}>
        <h2 className={styles.nameh1}>Set up Two-Factor Authentication</h2>
        <p className={styles.subtitle}>Scan the QR code below and enter the 6-digit code from your Authenticator</p>
        {qr && <img src={qr} alt="2FA QR Code" className={styles.qrSize} />}
        <input
            id="twoFAcode"
            className={styles.inputgroup}
            placeholder="XXXXXX"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required/>
        <button className={styles.submit2FACode} onClick={verify}>
            Verify
        </button>
        {success && <p className="text-green-500">✅ 2FA successfully enabled!</p>}
        </div>
    );
}
