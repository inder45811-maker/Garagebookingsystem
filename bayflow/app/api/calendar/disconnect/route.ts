import { NextResponse } from "next/server";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";

export async function POST() {
    const { user, error } = await requireAuth();
    if (error) return error as unknown as Response;

    try {
        await deleteDoc(doc(db, "users", user.uid, "integrations", "googleCalendar"));
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Error disconnecting calendar", err);
        return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
    }
}
