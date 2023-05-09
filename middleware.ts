import { type NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";

export const config = {
  matcher: ["/api/protected", "/compass", "/login"],
};

export async function middleware(req: NextRequest) {
  // validate the user is authenticated
  const verifiedToken = await verifyAuth(req).catch((err: Error) => {
    console.error(err.message);
  });

  if (verifiedToken && req.url.includes("/login")) {
    return NextResponse.redirect(new URL("/compass", req.url));
  }

  if (!verifiedToken) {
    // if this an API request, respond with JSON
    if (req.nextUrl.pathname.startsWith("/api/")) {
      return new NextResponse(
        JSON.stringify({ error: { message: "authentication required" } }),
        { status: 401 }
      );
    }
    // otherwise, redirect to the set token page
    else if (!req.nextUrl.pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
}
