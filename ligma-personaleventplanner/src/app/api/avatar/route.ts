export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server"
export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("u") || ""
  try {
    if (!url || !/^https?:\/\//i.test(url)) {
      return new NextResponse("Bad Request", { status: 400 })
    }
    const upstream = await fetch(url, {
      // No credentials; avoid leaking cookies
      credentials: "omit",
      // Some CDNs require referrer omitted
      referrerPolicy: "no-referrer",
      headers: {
        // Hint we accept common image types
        Accept: "image/*",
      },
    })
    if (!upstream.ok) {
      return new NextResponse("Upstream Error", { status: upstream.status })
    }
    const contentType = upstream.headers.get("content-type") || "image/jpeg"
    const buffer = await upstream.arrayBuffer()
    return new NextResponse(Buffer.from(buffer), {
      status: 200,
      headers: {
        "content-type": contentType,
        // Short cache to avoid flicker but allow updates
        "cache-control": "public, max-age=300",
      },
    })
  } catch {
    return new NextResponse("Server Error", { status: 500 })
  }
}

