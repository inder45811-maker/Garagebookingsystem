import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

export interface SessionUser {
    uid: string;
    email?: string;
}

/**
 * Verifies the Firebase ID token stored in the 'firebase-session' cookie.
 * Returns the decoded user or null if unauthenticated / token invalid.
 *
 * Used in every protected API route to get the real user's UID.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
    try {
        if (!adminAuth) {
            // Firebase Admin not configured — fail closed (deny by default)
            console.error("[session] Firebase Admin is not initialized.");
            return null;
        }
        const cookieStore = await cookies();
        const token = cookieStore.get("firebase-session")?.value;
        if (!token) return null;

        const decoded = await adminAuth.verifyIdToken(token);
        return { uid: decoded.uid, email: decoded.email };
    } catch (err) {
        // Token expired, revoked, or malformed — treat as unauthenticated
        console.warn("[session] Token verification failed:", err);
        return null;
    }
}

/**
 * Convenience helper that returns a 401 NextResponse
 * if the caller is not authenticated.
 */
export async function requireAuth(): Promise<
    { user: SessionUser; error: null } | { user: null; error: Response }
> {
    const { NextResponse } = await import("next/server");
    const user = await getSessionUser();
    if (!user) {
        return {
            user: null,
            error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) as unknown as Response,
        };
    }
    return { user, error: null };
}
