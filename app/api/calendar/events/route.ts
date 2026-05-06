import { NextResponse } from "next/server";
import { google } from "googleapis";
import { oauth2Client } from "@/lib/googleCalendar";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { requireAuth } from "@/lib/session";
import { decrypt } from "@/lib/encrypt";

export async function GET(request: Request) {
    const { user, error } = await requireAuth();
    if (error) return error as unknown as Response;

    try {
        const { searchParams } = new URL(request.url);
        const timeMin = searchParams.get("timeMin");
        const timeMax = searchParams.get("timeMax");

        const docRef = doc(db, "users", user.uid, "integrations", "googleCalendar");
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists() || !docSnap.data()?.refreshToken) {
            return NextResponse.json({ error: "Not connected" }, { status: 403 });
        }

        const encryptedToken = docSnap.data().refreshToken as string;
        const refreshToken = decrypt(encryptedToken);
        oauth2Client.setCredentials({ refresh_token: refreshToken });

        const calendar = google.calendar({ version: "v3", auth: oauth2Client });

        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: timeMin
                ? new Date(timeMin).toISOString()
                : new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
            timeMax: timeMax
                ? new Date(timeMax).toISOString()
                : new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString(),
            maxResults: 250,
            singleEvents: true,
            orderBy: "startTime",
        });

        const events = response.data.items?.map((item) => ({
            id: item.id,
            title: item.summary,
            start: item.start?.dateTime || item.start?.date,
            end: item.end?.dateTime || item.end?.date,
            backgroundColor: "#2563eb",
            borderColor: "#1d4ed8",
        })) || [];

        return NextResponse.json(events);
    } catch (err) {
        console.error("Error fetching calendar events", err);
        return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
    }
}
