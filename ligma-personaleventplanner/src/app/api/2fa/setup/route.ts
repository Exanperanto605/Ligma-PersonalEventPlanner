export const runtime = 'edge';

import { NextResponse } from "next/server";

// 2FA is currently disabled for this project. We keep the route
// to avoid breaking callers, but always respond with a disabled message.
export async function POST() {
  return NextResponse.json(
    { error: "2FA feature is disabled for this project." },
    { status: 501 }
  );
}
