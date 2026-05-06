# Vercel Deployment Walkthrough — BayFlow

A complete step-by-step guide to deploying BayFlow (Next.js) to Vercel production hosting with all integrations live.

---

## System Architecture

```
User Browser
    │
    ▼
Vercel (Next.js App)
    ├──► Firebase (Auth + Firestore)
    ├──► Resend (Email notifications)
    ├──► Twilio (SMS notifications)
    ├──► Stripe (Payments + webhooks)
    └──► UK Vehicle API (MOT lookups)

Vercel Cron (10:00 AM daily)
    └──► /api/cron/mot-reminders
```

---

## Phase 1 — Local Readiness

Before pushing to GitHub, verify your local setup is production-ready.

### Step 1: Confirm `.gitignore` is correct

Open [.gitignore](.gitignore) and check that `.env.local` is excluded. You should see a line like:

```
.env*.local
```

Your secrets must **never** be committed to Git.

### Step 2: Confirm build passes locally

Run a production build locally to catch any TypeScript or config errors before deploying:

```bash
npm run build
```

Fix any errors before continuing. A successful local build means Vercel will likely succeed too.

### Step 3: Push code to GitHub

If your code is not yet on GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## Phase 2 — Create & Connect Vercel

### Step 1: Create a Vercel account

Go to [vercel.com](https://vercel.com/) and sign up using **Continue with GitHub**. This links your repositories automatically.

### Step 2: Import your project

1. From your Vercel Dashboard, click **Add New...** → **Project**.
2. Find your **bayflow** repository in the list and click **Import**.
3. Vercel will detect it as a **Next.js** project automatically. Leave the framework preset as-is.
4. **Do not click Deploy yet** — you must set environment variables first.

---

## Phase 3 — Environment Variables

Before deploying, scroll down to the **Environment Variables** section on the project setup screen and add every variable below. You can also add them later via **Project Settings → Environment Variables**.

> All variables apply to **Production**, **Preview**, and **Development** environments unless noted.

### App Config

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | `https://your-app.vercel.app` — update after first deploy |

### Firebase (Client-side)

These come from your Firebase project's web app config (Firebase Console → Project Settings → Your apps).

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project config |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase project config |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project config |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase project config |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase project config |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase project config |

### Firebase Admin (Server-side)

These come from a Firebase service account (Firebase Console → Project Settings → Service Accounts → Generate new private key).

| Variable | Notes |
|---|---|
| `FIREBASE_ADMIN_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | From the downloaded service account JSON |
| `FIREBASE_ADMIN_PRIVATE_KEY` | From the JSON. Paste as-is including `-----BEGIN...-----END-----`. If you get auth errors, try wrapping the value in double quotes in Vercel. |

### Security Keys

| Variable | How to generate |
|---|---|
| `ENCRYPTION_KEY` | Run in your terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` — paste the output |
| `CRON_SECRET` | Any strong random string or UUID. Used to protect the cron endpoint. |

### Stripe & Payments

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys |

> Use **test keys** (`pk_test_...` / `sk_test_...`) for your first deploy to verify everything works before switching to live keys.

### Twilio (SMS)

| Variable | Where to find it |
|---|---|
| `TWILIO_ACCOUNT_SID` | Twilio Console → Account Info |
| `TWILIO_AUTH_TOKEN` | Twilio Console → Account Info |
| `TWILIO_MESSAGING_SERVICE_SID` | Twilio Console → Messaging → Services |

### Resend (Email)

| Variable | Where to find it |
|---|---|
| `RESEND_API_KEY` | Resend Dashboard → API Keys |
| `RESEND_FROM_EMAIL` | A verified sender address in your Resend account (e.g. `no-reply@yourdomain.com`) |

### Business Settings

| Variable | Example |
|---|---|
| `GARAGE_NAME` | `Bay Street Garage` |
| `GARAGE_PHONE` | `01234 567890` |
| `GOOGLE_REVIEW_LINK` | Your Google Maps review URL |
| `GARAGE_TIMEZONE` | `Europe/London` |

### Vehicle Lookup

| Variable | Notes |
|---|---|
| `UK_VEHICLE_API_KEY` | Your DVLA / vehicle data API key |
| `UK_VEHICLE_API_URL` | The API base URL |

---

## Phase 4 — First Deploy

Once all variables are set:

1. Click **Deploy**.
2. Vercel will clone your repo, run `npm run build`, and publish the result.
3. Monitor the **Build Logs** tab for any errors.

If the build fails, the logs will show the exact error. Common issues:
- Missing environment variable referenced in code
- TypeScript error that didn't show locally
- A package that requires a specific Node.js version (set under **Project Settings → General → Node.js Version**)

Once successful, Vercel will give you a URL like `https://bayflow-abc123.vercel.app`.

### Update `NEXT_PUBLIC_BASE_URL`

Go to **Project Settings → Environment Variables**, find `NEXT_PUBLIC_BASE_URL`, and update it to your actual Vercel URL. Then **redeploy** (Deployments → click the 3-dot menu on your latest deploy → Redeploy).

---

## Phase 5 — Cron Job Verification

Your [vercel.json](vercel.json) registers a daily cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/mot-reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

This runs at **10:00 AM UTC** every day.

### Verify it registered

1. Go to **Project Settings → Cron Jobs**.
2. You should see `/api/cron/mot-reminders` listed with the schedule `0 10 * * *`.

### Verify the endpoint is secured

Your cron route should reject any request that doesn't include the correct `CRON_SECRET` header:

```ts
if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return new Response('Unauthorized', { status: 401 });
}
```

### Trigger it manually to test

From the **Cron Jobs** settings page, click **Run** to trigger the job immediately and check its logs.

---

## Phase 6 — External Service Whitelisting

Your app's live domain must be registered in each external service.

### Firebase: Authorize the Vercel domain

1. Go to [Firebase Console](https://console.firebase.google.com) → your project.
2. Navigate to **Authentication → Settings → Authorized Domains**.
3. Click **Add Domain**.
4. Add your Vercel URL: `your-app.vercel.app`

If you have a custom domain, add that too.

### Google OAuth: Add redirect URIs

If using Google Sign-In:

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Edit your **OAuth 2.0 Client ID**.
3. Under **Authorized JavaScript Origins**, add: `https://your-app.vercel.app`
4. Under **Authorized Redirect URIs**, add: `https://your-app.vercel.app/api/auth/callback/google`

### Stripe: Register a webhook

1. Go to [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/webhooks).
2. Click **Add endpoint**.
3. Set the URL to: `https://your-app.vercel.app/api/webhooks/stripe`
4. Select the events your app handles (e.g. `payment_intent.succeeded`, `checkout.session.completed`).
5. Copy the **Webhook Signing Secret** and add it as an environment variable in Vercel:

| Variable | Value |
|---|---|
| `STRIPE_WEBHOOK_SECRET` | The `whsec_...` signing secret from this webhook |

---

## Phase 7 — Post-Deploy Checks

Work through this list to confirm everything is live and functional.

- [ ] App loads at your Vercel URL without errors
- [ ] Firebase login / sign-up works
- [ ] Google OAuth redirects back correctly (if enabled)
- [ ] Job queue page loads and data persists via Firestore
- [ ] A test SMS is sent via Twilio (trigger a notification flow)
- [ ] A test email is sent via Resend
- [ ] Cron job runs successfully (manually triggered from Vercel dashboard)
- [ ] Stripe test payment completes and webhook receives the event
- [ ] UK vehicle lookup returns data for a test registration

---

## Custom Domain (Optional)

1. Go to **Project Settings → Domains**.
2. Add your domain (e.g. `app.yourgaragename.co.uk`).
3. Follow Vercel's DNS instructions to point your domain.
4. Once verified, update `NEXT_PUBLIC_BASE_URL`, the Firebase authorized domain, the Google OAuth URIs, and the Stripe webhook URL to use your custom domain.
5. Redeploy after updating the environment variable.
