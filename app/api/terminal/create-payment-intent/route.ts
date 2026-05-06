import { NextResponse } from "next/server";
import Stripe from "stripe";
import { requireAuth } from "@/lib/session";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2026-02-25.clover",
});

// Safety ceiling: reject any single charge above £10,000
const MAX_AMOUNT_GBP = 10_000;

export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error as unknown as Response;

    try {
        const { amount, currency = "gbp", jobId, garageId } = await request.json();

        if (!amount || !jobId) {
            return NextResponse.json(
                { error: "Missing required parameters: amount, jobId" },
                { status: 400 }
            );
        }

        // Validate amount is a positive number within the ceiling (fixes H-3 side effect)
        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return NextResponse.json(
                { error: "amount must be a positive number" },
                { status: 400 }
            );
        }
        if (numericAmount > MAX_AMOUNT_GBP) {
            return NextResponse.json(
                { error: `Amount exceeds maximum allowed charge of £${MAX_AMOUNT_GBP}` },
                { status: 400 }
            );
        }

        const amountInPence = Math.round(numericAmount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPence,
            currency,
            payment_method_types: ["card_present"],
            capture_method: "manual",
            metadata: {
                jobId,
                garageId: garageId ?? "default",
                source: "bayflow_terminal",
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            intentId: paymentIntent.id,
        });
    } catch (err: unknown) {
        console.error("Error creating terminal payment intent:", err);
        return NextResponse.json(
            { error: (err instanceof Error ? err.message : String(err)) ?? "Failed to create PaymentIntent" },
            { status: 500 }
        );
    }
}
