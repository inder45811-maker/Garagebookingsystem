import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import {
    sendSMS,
    sendEmail,
    motReminderHtml,
} from "@/lib/notifications";

export async function GET(request: Request) {
    // Validate cron secret — explicitly check that the env var IS set (fixes C-5)
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        console.error("[cron] CRON_SECRET env var is not set. Refusing to run.");
        return NextResponse.json({ error: "Server misconfiguration" }, { status: 503 });
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const allJobs = await store.getJobs();
        const allCustomers = await store.getCustomers();

        const now = new Date();
        const elevenMonthsAgo = new Date();
        elevenMonthsAgo.setDate(now.getDate() - 334);

        const startOfTargetDay = new Date(elevenMonthsAgo.setHours(0, 0, 0, 0));
        const endOfTargetDay = new Date(elevenMonthsAgo.setHours(23, 59, 59, 999));

        const jobsDueForReminder = allJobs.filter((job) => {
            if (job.status !== "collected" && job.paymentStatus !== "paid") return false;
            const jobDate = new Date(job.updatedAt || job.createdAt);
            return jobDate >= startOfTargetDay && jobDate <= endOfTargetDay;
        });

        if (jobsDueForReminder.length === 0) {
            return NextResponse.json({ status: "Success", message: "No reminders to send today." });
        }

        const garageName = process.env.GARAGE_NAME ?? "BayFlow Garage";
        const garagePhone = process.env.GARAGE_PHONE ?? "your garage";
        const googleReviewLink = process.env.GOOGLE_REVIEW_LINK;
        const results = [];

        for (const job of jobsDueForReminder) {
            const customer = allCustomers.find((c) => c.id === job.customerId);
            const customerPhone = customer?.phone;
            const customerEmail = customer?.email;

            if (!customerPhone && !customerEmail) {
                results.push({ jobId: job.id, status: "skipped", reason: "no customer contact info" });
                continue;
            }

            const smsBody = `Hi! Your vehicle (${job.vehicle.registration}) visited ${garageName} 11 months ago. Your MOT/Service might be due soon. Reply to book or call us on ${garagePhone}.`;
            const emailHtml = motReminderHtml({
                registration: job.vehicle.registration,
                garageName,
                garagePhone,
                googleReviewLink,
            });

            const attempt: { sms?: string; email?: string } = {};

            // SMS
            if (customerPhone) {
                const smsResult = await sendSMS({ to: customerPhone, body: smsBody });
                attempt.sms = smsResult.ok ? "sent" : `failed: ${smsResult.error}`;
            }

            // Email
            if (customerEmail) {
                const emailResult = await sendEmail({
                    to: customerEmail,
                    subject: `Your MOT/Service is due soon — ${job.vehicle.registration}`,
                    html: emailHtml,
                });
                attempt.email = emailResult.ok ? "sent" : `failed: ${emailResult.error}`;
            }

            // Log to communication history
            const logs = [
                ...(job.communications ?? []),
                ...(attempt.sms === "sent"
                    ? [{
                        id: crypto.randomUUID(),
                        timestamp: new Date().toISOString(),
                        type: "sms" as const,
                        message: smsBody,
                        loggedBy: "Automated System (MOT Cron)",
                    }]
                    : []),
                ...(attempt.email === "sent"
                    ? [{
                        id: crypto.randomUUID(),
                        timestamp: new Date().toISOString(),
                        type: "email" as const,
                        message: `MOT reminder email sent to ${customerEmail}`,
                        loggedBy: "Automated System (MOT Cron)",
                    }]
                    : []),
            ];

            if (logs.length > (job.communications ?? []).length) {
                await store.updateJob(job.id, { communications: logs });
            }

            results.push({ jobId: job.id, ...attempt });
        }

        return NextResponse.json({ status: "Success", processed: jobsDueForReminder.length, results });
    } catch (err: unknown) {
        console.error("CRON MOT Error:", err);
        return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
    }
}
