import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAuth } from "@/lib/session";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
});

export async function POST() {
    const { error } = await requireAuth();
    if (error) return error as unknown as Response;

    try {
        const connectionToken = await stripe.terminal.connectionTokens.create();
        return NextResponse.json({ secret: connectionToken.secret });
    } catch (err: unknown) {
        console.error("Error generating terminal connection token:", err);
        return NextResponse.json(
            { error: (err instanceof Error ? err.message : String(err)) ?? "Failed to create connection token" },
            { status: 500 }
        );
    }
}
