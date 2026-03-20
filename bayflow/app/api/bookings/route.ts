import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import {
    sendSMS,
    sendEmail,
    bookingConfirmationHtml,
} from "@/lib/notifications";

// Simple in-memory rate limiter (IP → { count, windowStart })
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5;   // max 5 bookings per minute per IP

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);
    if (!entry || now - entry.windowStart > WINDOW_MS) {
        rateLimitMap.set(ip, { count: 1, windowStart: now });
        return false;
    }
    if (entry.count >= MAX_REQUESTS) return true;
    entry.count++;
    return false;
}

// Basic input sanitizer — strips HTML tags
function sanitize(value: string): string {
    return value.replace(/<[^>]*>/g, "").trim();
}

// UK registration plate allowlist: letters, digits, and spaces only
const REG_PATTERN = /^[A-Z0-9\s]{1,10}$/i;

export async function POST(request: Request) {
    // Rate limiting
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0].trim() || "unknown";
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: "Too many booking requests. Please try again later." },
            { status: 429 }
        );
    }

    let body: Record<string, string>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const {
        customerName,
        phone,
        email,
        registration,
        make,
        model,
        jobType,
        description,
        date,
        time = "09:00",
    } = body;

    // --- Input validation ---
    if (!customerName || !phone || !registration || !make || !model || !date) {
        return NextResponse.json(
            { error: "Missing required fields: customerName, phone, registration, make, model, date" },
            { status: 400 }
        );
    }

    const cleanReg = sanitize(registration).toUpperCase().replace(/\s/g, " ");
    if (!REG_PATTERN.test(cleanReg)) {
        return NextResponse.json(
            { error: "Invalid registration plate format" },
            { status: 400 }
        );
    }

    if (sanitize(customerName).length > 100) {
        return NextResponse.json({ error: "Customer name too long" }, { status: 400 });
    }
    if (sanitize(description || "").length > 1000) {
        return NextResponse.json({ error: "Description too long" }, { status: 400 });
    }

    const garageName = process.env.GARAGE_NAME ?? "BayFlow Garage";
    const garagePhone = process.env.GARAGE_PHONE ?? "your garage";
    const cleanName = sanitize(customerName);
    const cleanPhone = sanitize(phone);
    const cleanEmail = email ? sanitize(email) : undefined;

    try {
        const customer = await store.addCustomer({
            name: cleanName,
            phone: cleanPhone,
            email: cleanEmail,
            vehicleIds: [],
        });

        const job = await store.addJob({
            customerId: customer.id,
            vehicle: {
                registration: cleanReg,
                make: sanitize(make),
                model: sanitize(model),
            },
            type: sanitize(jobType || "Service"),
            status: "pending_approval",
            description: `ONLINE BOOKING: ${sanitize(description || "")}`,
            startTime: `${date}T${time}:00`,
            queuePosition: -1,
        });

        // ── Fire-and-forget notifications (non-blocking) ──────────────────
        const smsBody = `Hi ${cleanName}! Your booking at ${garageName} on ${date} at ${time} for ${cleanReg} has been received. We'll be in touch to confirm. Questions? Call ${garagePhone}.`;

        const notifyPromises: Promise<unknown>[] = [
            // SMS to customer
            sendSMS({ to: cleanPhone, body: smsBody }),
        ];

        // Email to customer (if they provided one)
        if (cleanEmail) {
            notifyPromises.push(
                sendEmail({
                    to: cleanEmail,
                    subject: `Booking Received — ${cleanReg} at ${garageName}`,
                    html: bookingConfirmationHtml({
                        customerName: cleanName,
                        registration: cleanReg,
                        make: sanitize(make),
                        model: sanitize(model),
                        jobType: sanitize(jobType || "Service"),
                        date,
                        time,
                        garageName,
                        garagePhone,
                    }),
                })
            );
        }

        // Log the SMS into the job's communication log (best-effort)
        Promise.allSettled(notifyPromises).then(async ([smsResult]) => {
            if (smsResult.status === "fulfilled" && (smsResult.value as { ok?: boolean })?.ok) {
                await store.updateJob(job.id, {
                    communications: [
                        ...(job.communications ?? []),
                        {
                            id: crypto.randomUUID(),
                            timestamp: new Date().toISOString(),
                            type: "sms" as const,
                            message: smsBody,
                            loggedBy: "Automated System (Booking Confirmation)",
                        },
                    ],
                });
            }
        });

        return NextResponse.json({ success: true }, { status: 201 });
    } catch (error: unknown) {
        console.error("Booking submission failed:", error);
        return NextResponse.json(
            { error: "Failed to submit booking" },
            { status: 500 }
        );
    }
}
