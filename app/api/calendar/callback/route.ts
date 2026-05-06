import { NextResponse } from "next/server";
import { oauth2Client } from "@/lib/googleCalendar";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import { encrypt } from "@/lib/encrypt";

export async function GET(request: Request) {
    // Validate the caller is authenticated before exchanging the code
    const { user, error } = await requireAuth();
    if (error) return error as unknown as Response;

    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.json({ error: "No code provided" }, { status: 400 });
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);

        // Encrypt tokens before storing in Firestore (fixes C-4)
        const encryptedAccess = tokens.access_token ? encrypt(tokens.access_token) : null;
        const encryptedRefresh = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;

        await setDoc(
            doc(db, "users", user.uid, "integrations", "googleCalendar"),
            {
                // Store encrypted tokens only
                accessToken: encryptedAccess,
                refreshToken: encryptedRefresh,
                expiryDate: tokens.expiry_date,
                updatedAt: new Date().toISOString(),
            }
        );

        return NextResponse.redirect(new URL("/settings", request.url));
    } catch (err) {
        console.error("Error exchanging code for tokens", err);
        return NextResponse.redirect(
            new URL("/settings?error=auth_failed", request.url)
        );
    }
}
