/**
 * lib/notifications.ts
 * ─────────────────────────────────────────────────────────────
 * Centralised helper for all customer notifications.
 *
 * SMS  → Twilio  (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_MESSAGING_SERVICE_SID)
 * Email→ Resend  (RESEND_API_KEY / RESEND_FROM_EMAIL)
 *
 * Both functions gracefully no-op (and log a warning) when the
 * required environment variables are not set, so the app never
 * crashes just because a notification key is missing.
 * ─────────────────────────────────────────────────────────────
 */

import twilio from "twilio";
import { Resend } from "resend";

export interface SMSOptions {
  to: string;    // E.164 format recommended (+447700900000) or UK local
  body: string;
}

export interface EmailOptions {
  to: string;            // recipient address
  subject: string;
  html: string;          // rich HTML body
  cc?: string;           // optional garage copy
}

export interface NotifyResult {
  ok: boolean;
  error?: string;
}

// ── SMS via Twilio ────────────────────────────────────────────
export async function sendSMS({ to, body }: SMSOptions): Promise<NotifyResult> {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_SERVICE_SID } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_MESSAGING_SERVICE_SID) {
    console.warn("[notify] Twilio credentials not set — SMS skipped.");
    return { ok: false, error: "Twilio credentials not configured" };
  }

  try {
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    await client.messages.create({
      messagingServiceSid: TWILIO_MESSAGING_SERVICE_SID,
      to,
      body,
    });
    console.info(`[notify] SMS sent to ${to}`);
    return { ok: true };
  } catch (err: unknown) {
    console.error("[notify] SMS failed:", err instanceof Error ? err.message : String(err));
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ── Email via Resend ──────────────────────────────────────────
export async function sendEmail({ to, subject, html, cc }: EmailOptions): Promise<NotifyResult> {
  const { RESEND_API_KEY, RESEND_FROM_EMAIL } = process.env;

  if (!RESEND_API_KEY || !RESEND_FROM_EMAIL) {
    console.warn("[notify] Resend credentials not set — email skipped.");
    return { ok: false, error: "Resend credentials not configured" };
  }

  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: RESEND_FROM_EMAIL,
      to,
      ...(cc ? { cc } : {}),
      subject,
      html,
    });
    console.info(`[notify] Email sent to ${to}`);
    return { ok: true };
  } catch (err: unknown) {
    console.error("[notify] Email failed:", err instanceof Error ? err.message : String(err));
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ── HTML email templates ──────────────────────────────────────
export function bookingConfirmationHtml(opts: {
  customerName: string;
  registration: string;
  make: string;
  model: string;
  jobType: string;
  date: string;
  time: string;
  garageName: string;
  garagePhone: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr><td style="background:#1a1a2e;padding:24px 32px">
          <h1 style="margin:0;color:#fff;font-size:22px">${opts.garageName}</h1>
          <p style="margin:4px 0 0;color:#a0a0b0;font-size:14px">Booking Confirmation</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:16px;color:#333">Hi <strong>${opts.customerName}</strong>,</p>
          <p style="margin:0 0 24px;font-size:15px;color:#555">
            We've received your booking. Here's a summary:
          </p>
          <table width="100%" cellpadding="8" cellspacing="0" style="background:#f9f9f9;border-radius:6px;margin-bottom:24px">
            <tr><td style="color:#888;font-size:13px;width:40%">Vehicle</td>
                <td style="color:#222;font-size:14px;font-weight:600">${opts.registration} — ${opts.make} ${opts.model}</td></tr>
            <tr style="background:#f0f0f0"><td style="color:#888;font-size:13px">Service</td>
                <td style="color:#222;font-size:14px;font-weight:600">${opts.jobType}</td></tr>
            <tr><td style="color:#888;font-size:13px">Date</td>
                <td style="color:#222;font-size:14px;font-weight:600">${opts.date}</td></tr>
            <tr style="background:#f0f0f0"><td style="color:#888;font-size:13px">Time</td>
                <td style="color:#222;font-size:14px;font-weight:600">${opts.time}</td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:14px;color:#555">
            We'll be in touch to confirm your appointment. If you need to make any changes, please call us on <strong>${opts.garagePhone}</strong>.
          </p>
        </td></tr>
        <tr><td style="background:#f5f5f5;padding:16px 32px;text-align:center">
          <p style="margin:0;font-size:12px;color:#999">${opts.garageName} · ${opts.garagePhone}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function motReminderHtml(opts: {
  registration: string;
  garageName: string;
  garagePhone: string;
  googleReviewLink?: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr><td style="background:#1a1a2e;padding:24px 32px">
          <h1 style="margin:0;color:#fff;font-size:22px">${opts.garageName}</h1>
          <p style="margin:4px 0 0;color:#a0a0b0;font-size:14px">MOT / Service Reminder</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 16px;font-size:16px;color:#333">
            Your vehicle <strong>${opts.registration}</strong> visited us around 11 months ago — which means your MOT or annual service may be coming up soon!
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#555">
            Don't leave it too late. Book your slot now to stay road-legal and keep your vehicle running smoothly.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
            <a href="tel:${opts.garagePhone}" style="display:inline-block;background:#1a1a2e;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-size:15px;font-weight:600">
              📞 Call to Book — ${opts.garagePhone}
            </a>
          </td></tr></table>
          ${opts.googleReviewLink ? `
          <p style="margin:24px 0 0;font-size:13px;color:#999;text-align:center">
            Happy with our service? <a href="${opts.googleReviewLink}" style="color:#1a1a2e">Leave us a Google review</a> — it really helps!
          </p>` : ""}
        </td></tr>
        <tr><td style="background:#f5f5f5;padding:16px 32px;text-align:center">
          <p style="margin:0;font-size:12px;color:#999">${opts.garageName} · ${opts.garagePhone}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function jobStatusHtml(opts: {
  customerName: string;
  registration: string;
  status: string;
  message: string;
  garageName: string;
  garagePhone: string;
}): string {
  const statusLabel: Record<string, string> = {
    ready: "✅ Ready for Collection",
    collected: "🎉 Job Complete",
    in_bay: "🔧 Work in Progress",
    awaiting_approval: "📋 Awaiting Your Approval",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
        <tr><td style="background:#1a1a2e;padding:24px 32px">
          <h1 style="margin:0;color:#fff;font-size:22px">${opts.garageName}</h1>
          <p style="margin:4px 0 0;color:#a0a0b0;font-size:14px">Vehicle Update — ${opts.registration}</p>
        </td></tr>
        <tr><td style="padding:32px">
          <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#1a1a2e">
            ${statusLabel[opts.status] ?? "Update on your vehicle"}
          </p>
          <p style="margin:0 0 24px;font-size:15px;color:#555">Hi <strong>${opts.customerName}</strong>, ${opts.message}</p>
          <p style="margin:0;font-size:14px;color:#888">
            Questions? Call us on <strong>${opts.garagePhone}</strong>.
          </p>
        </td></tr>
        <tr><td style="background:#f5f5f5;padding:16px 32px;text-align:center">
          <p style="margin:0;font-size:12px;color:#999">${opts.garageName} · ${opts.garagePhone}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
