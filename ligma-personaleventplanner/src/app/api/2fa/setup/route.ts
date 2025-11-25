export const runtime = 'edge';

import { NextResponse } from "next/server";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
// import { db } from '@/app/context/firebaseConfig.js' <-- Real
import { db } from '@/app/context/firebaseConfig.js'
import { doc, setDoc } from "firebase/firestore";


export async function POST(req: Request) {
    const { userID, email } = await req.json();

    if (!userID || !email) {
        return NextResponse.json({ error: "Missing user ID or e-mail" }, { status: 400 });
    }

    const secret = speakeasy.generateSecret({
        name: `Next2FA (${email})`
    });

    const qrCodeDataURL = QRCode.toDataURL(secret.otpauth_url!);

    const userRef = doc(db, "users", userID);
    await setDoc(userRef,{
            is2FAEnabled: false,
            twoFASecret: secret.base32
        },
        { merge: true }
    );

    return NextResponse.json({ qrCode: qrCodeDataURL, base32: secret.base32 });
}
