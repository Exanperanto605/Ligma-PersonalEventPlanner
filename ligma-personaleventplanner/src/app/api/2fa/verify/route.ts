export const runtime = 'edge';

import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
// import { db } from '@/app/context/firebaseConfig.js' <-- Real
import { db } from '@/app/context/firebaseConfig.js'
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { error } from "console";

export async function POST(req: Request) {
    const { userID, token } = await req.json();
    if (!userID || !token) {
        return NextResponse.json({ error: "Missing user ID or token" }, { status: 400 });
    }

    const userRef = doc(db, "users", userID);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const secret = snap.data().is2FAEnabled;
    if (!secret) {
        return NextResponse.json({ error: "No 2FA secret found — 2FA disabled" }, { status: 400 });
    }

    const verified = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 1
    });

    if (verified) {
        await updateDoc(userRef, { is2FAEnabled: true });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false,  error: "Invalid code" });
}
