import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import twilio from "twilio";
import { store } from "@/lib/store";
import { requireAuth } from "@/lib/session";

export async function POST(request: Request) {
    const { error } = await requireAuth();
    if (error) return error as unknown as Response;

    try {
        const { paymentIntentId, jobId } = await request.json();

        if (!paymentIntentId) {
            return NextResponse.json({ error: "Missing paymentIntentId" }, { status: 400 });
        }

        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

        // Automated Google Review SMS (2-hour delay)
        try {
            const {
                TWILIO_ACCOUNT_SID,
                TWILIO_AUTH_TOKEN,
                TWILIO_MESSAGING_SERVICE_SID,
            } = process.env;

            if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_MESSAGING_SERVICE_SID) {
                // Look up real customer phone from job record (fixes H-4)
                let customerPhone: string | undefined;
                const garageName = process.env.GARAGE_NAME ?? "BayFlow Garage";
                const reviewLink =
                    process.env.GOOGLE_REVIEW_LINK ?? "https://g.page/r/example/review";

                if (jobId) {
                    const allJobs = await store.getJobs();
                    const job = allJobs.find((j) => j.id === jobId);
                    if (job) {
                        const customers = await store.getCustomers();
                        const customer = customers.find((c) => c.id === job.customerId);
                        customerPhone = customer?.phone;
                    }
                }

                if (!customerPhone) {
                    console.warn("No customer phone found for job", jobId, "— skipping SMS");
                } else {
                    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
                    const sendAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
                    const messageBody = `Thanks for visiting ${garageName}! If you were happy with your service, please leave us a quick review: ${reviewLink}`;

                    await client.messages.create({
                        messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
                        to: customerPhone,
                        body: messageBody,
                        scheduleType: "fixed",
                        sendAt,
                    });
                    console.log("Scheduled Google Review SMS for:", sendAt.toISOString());

                    // Log the communication
                    if (jobId) {
                        const allJobs = await store.getJobs();
                        const job = allJobs.find((j) => j.id === jobId);
                        if (job) {
                            const newLog = {
                                id: crypto.randomUUID(),
                                timestamp: new Date().toISOString(),
                                type: "sms" as const,
                                message: `[Automated review request scheduled for ${sendAt.toLocaleString()}] ${messageBody}`,
                                loggedBy: "Automated System",
                            };
                            await store.updateJob(job.id, {
                                communications: [...(job.communications ?? []), newLog],
                            });
                        }
                    }
                }
            } else {
                console.warn("Twilio credentials missing. Skipping Review SMS.");
            }
        } catch (smsError) {
            console.error("Failed to schedule Twilio Review SMS:", smsError);
            // Non-blocking — payment still succeeds
        }

        return NextResponse.json({
            status: paymentIntent.status,
            intentId: paymentIntent.id,
            amountCaptured: paymentIntent.amount_received,
        });
    } catch (err: unknown) {
        console.error("Error capturing terminal payment intent:", err);
        return NextResponse.json(
            { error: (err instanceof Error ? err.message : String(err)) ?? "Failed to capture PaymentIntent" },
            { status: 500 }
        );
    }
}
