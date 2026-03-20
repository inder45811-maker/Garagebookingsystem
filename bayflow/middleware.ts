import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that do NOT require authentication
const PUBLIC_PREFIXES = [
    "/login",
    "/signup",
    "/book",
    "/about",
    "/features",
    "/pricing",
    // Public API routes
    "/api/bookings",
    "/api/calendar/auth",
    "/api/calendar/callback",
    "/api/cron",
    "/api/vehicle-lookup",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Static assets and Next internals — always allow
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.startsWith("/public")
    ) {
        return NextResponse.next();
    }

    // Root landing page is public
    if (pathname === "/") return NextResponse.next();

    // Check against public prefixes
    const isPublic = PUBLIC_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
    );
    if (isPublic) return NextResponse.next();

    // Check for Firebase session token stored in cookie
    const session = request.cookies.get("firebase-session")?.value;

    if (!session) {
        // API routes return 401 JSON; page routes redirect to login
        if (pathname.startsWith("/api/")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
