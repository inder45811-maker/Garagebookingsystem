import { NextResponse } from "next/server";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";

export async function GET() {
    const { user, error } = await requireAuth();
    if (error) return error as unknown as Response;

    try {
        const docRef = doc(db, "users", user.uid, "integrations", "googleCalendar");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && docSnap.data()?.refreshToken) {
            return NextResponse.json({ connected: true });
        }
        return NextResponse.json({ connected: false });
    } catch (err) {
        console.error("Error fetching calendar status", err);
        return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
    }
}
