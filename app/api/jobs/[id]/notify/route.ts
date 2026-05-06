/**
 * POST /api/jobs/[id]/notify
 * ─────────────────────────────────────────────────────────────
 * Sends a manual notification to the customer for a given job.
 * Requires an authenticated session (admin or mechanic).
 *
 * Body: {
 *   channel: "sms" | "email" | "both"
 *   message: string
 * }
 * ─────────────────────────────────────────────────────────────
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { store } from "@/lib/store";
import { sendSMS, sendEmail, jobStatusHtml } from "@/lib/notifications";
import type { CommunicationLog } from "@/types";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    // Auth guard
    const { user: session, error: authError } = await requireAuth();
    if (authError) return authError as Response;
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { channel?: string; message?: string };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { channel, message } = body;

    if (!channel || !["sms", "email", "both"].includes(channel)) {
        return NextResponse.json(
            { error: 'channel must be one of: "sms", "email", "both"' },
            { status: 400 }
        );
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
        return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    if (message.trim().length > 1600) {
        return NextResponse.json({ error: "message is too long (max 1600 chars)" }, { status: 400 });
    }

    // Fetch job + customer
    const allJobs = await store.getJobs();
    const job = allJobs.find((j) => j.id === id);
    if (!job) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const allCustomers = await store.getCustomers();
    const customer = allCustomers.find((c) => c.id === job.customerId);
    if (!customer) {
        return NextResponse.json({ error: "Customer not found for this job" }, { status: 404 });
    }

    const garageName = process.env.GARAGE_NAME ?? "BayFlow Garage";
    const garagePhone = process.env.GARAGE_PHONE ?? "";
    const trimmedMessage = message.trim();
    const newLogs: CommunicationLog[] = [];
    const results: Record<string, string> = {};

    // ── SMS ─────────────────────────────────────────────────
    if (channel === "sms" || channel === "both") {
        if (!customer.phone) {
            results.sms = "skipped — no customer phone";
        } else {
            const smsResult = await sendSMS({ to: customer.phone, body: trimmedMessage });
            results.sms = smsResult.ok ? "sent" : `failed: ${smsResult.error}`;
            if (smsResult.ok) {
                newLogs.push({
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    type: "sms",
                    message: trimmedMessage,
                    loggedBy: session.email ?? "Staff",
                });
            }
        }
    }

    // ── Email ────────────────────────────────────────────────
    if (channel === "email" || channel === "both") {
        if (!customer.email) {
            results.email = "skipped — no customer email";
        } else {
            const emailResult = await sendEmail({
                to: customer.email,
                subject: `Update on your vehicle ${job.vehicle.registration} — ${garageName}`,
                html: jobStatusHtml({
                    customerName: customer.name,
                    registration: job.vehicle.registration,
                    status: job.status,
                    message: trimmedMessage,
                    garageName,
                    garagePhone,
                }),
            });
            results.email = emailResult.ok ? "sent" : `failed: ${emailResult.error}`;
            if (emailResult.ok) {
                newLogs.push({
                    id: crypto.randomUUID(),
                    timestamp: new Date().toISOString(),
                    type: "email",
                    message: trimmedMessage,
                    loggedBy: session.email ?? "Staff",
                });
            }
        }
    }

    // Persist communication logs
    if (newLogs.length > 0) {
        await store.updateJob(job.id, {
            communications: [...(job.communications ?? []), ...newLogs],
        });
    }

    const ok = Object.values(results).some((r) => r === "sent");
    return NextResponse.json({ ok, results });
}
