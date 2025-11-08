"use client";

import { useEffect, useState } from "react";
import { auth } from "../context/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../context/firebaseConfig";

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
        const res = await fetch("../../api/2fa/setup", {
            method: "POST",
            headers: { "Content-Type" : "application/json" },
            body: JSON.stringify({ uid: user?.uid, email: user?.email })
        });

        const data = await res.json();
        setVerified(data.success);

        const userRef = doc(db, "userInfo", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            await updateDoc(userRef, {
                is2FAEnabled: true
            });
        }
    }

    useEffect(() => {
        setup2FA();
    }, []);

    return (    // Placeholder
        <div className="flex flex-col items-center gap-4 p-8">
        <h2 className="text-lg font-semibold">Set up Two-Factor Authentication</h2>
        {qr && <img src={qr} alt="2FA QR Code" className="w-48 h-48" />}
        <input
            className="border p-2 rounded"
            placeholder="Enter code from Authenticator"
            value={code}
            onChange={(e) => setCode(e.target.value)}
        />
        <button onClick={verify} className="bg-blue-500 text-white px-4 py-2 rounded">
            Verify
        </button>
        {success && <p className="text-green-500">✅ 2FA successfully enabled!</p>}
        </div>
    );
}
