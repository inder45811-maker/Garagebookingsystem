import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { adminAuth } from "@/lib/firebaseAdmin";
import { adminDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
    // Only admins can register mechanics
    const { user, error } = await requireAuth();
    if (error) return error as unknown as Response;

    let body: { name: string; email: string; password: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { name, email, password } = body;
    if (!name || !email || !password) {
        return NextResponse.json(
            { error: "name, email and password are required" },
            { status: 400 }
        );
    }
    if (password.length < 8) {
        return NextResponse.json(
            { error: "Password must be at least 8 characters" },
            { status: 400 }
        );
    }

    if (!adminAuth || !adminDb) {
        return NextResponse.json(
            { error: "Server auth not configured" },
            { status: 503 }
        );
    }

    try {
        // Create the Firebase Auth user via Admin SDK
        // (current admin session is NOT affected)
        const newUser = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        // Store the user profile in Firestore
        await adminDb.collection("users").doc(newUser.uid).set({
            email,
            name,
            role: "mechanic",
            garageId: "garage_001", // TODO: derive from inviting admin's profile
            createdAt: new Date().toISOString(),
            createdBy: user.uid,
        });

        return NextResponse.json({
            user: {
                id: newUser.uid,
                email,
                name,
                role: "mechanic",
                garageId: "garage_001",
            },
        });
    } catch (err: unknown) {
        console.error("registerMechanic error:", err);
        // Surface Firebase's useful codes (e.g. email-already-exists)
        return NextResponse.json(
            { error: (err instanceof Error ? err.message : String(err)) || "Failed to register mechanic" },
            { status: 500 }
        );
    }
}
