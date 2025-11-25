export const runtime = 'edge';

import { NextResponse } from "next/server";

// 2FA is currently disabled for this project. This route
// remains for compatibility but always returns disabled.
export async function POST() {
  return NextResponse.json(
    { error: "2FA feature is disabled for this project." },
    { status: 501 }
  );
}
