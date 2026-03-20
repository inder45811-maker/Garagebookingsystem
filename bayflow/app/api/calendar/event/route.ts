import { NextResponse } from "next/server";
import { createCalendarEvent } from "@/lib/googleCalendar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import { decrypt } from "@/lib/encrypt";

export async function POST(request: Request) {
    const { user, error } = await requireAuth();
    if (error) return error as unknown as Response;

    try {
        const body = await request.json();
        const { summary, description, startTime, endTime } = body;

        if (!summary || !startTime || !endTime) {
            return NextResponse.json({ error: "Missing required event fields" }, { status: 400 });
        }

        const docRef = doc(db, "users", user.uid, "integrations", "googleCalendar");
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || !docSnap.data()?.refreshToken) {
            return NextResponse.json({ error: "Not connected to Google Calendar" }, { status: 403 });
        }

        // Decrypt the stored refresh token before use
        const encryptedToken = docSnap.data().refreshToken as string;
        const refreshToken = decrypt(encryptedToken);

        const event = await createCalendarEvent(refreshToken, {
            summary,
            description,
            startTime,
            endTime,
        });

        return NextResponse.json({ eventId: event.id });
    } catch (err) {
        console.error("Error creating calendar event", err);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
