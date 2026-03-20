import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/googleCalendar";

export async function GET() {
    try {
        const url = getAuthUrl();
        return NextResponse.redirect(url);
    } catch (error) {
        console.error("Error generating auth URL", error);
        return NextResponse.json({ error: "Failed to start authentication" }, { status: 500 });
    }
}
