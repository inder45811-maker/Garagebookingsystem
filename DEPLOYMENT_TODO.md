# 📋 Vercel Deployment Checklist

Follow this checklist to deploy your **Bayflow** application to Vercel successfully.

---

## 🛠️ Phase 1: Setup & Connect
- [ ] **Create a Vercel Account** at [vercel.com](https://vercel.com/) if you haven't already.
- [ ] **Push your code to GitHub** (or GitLab/Bitbucket).
  - Ensure `.env.local` is **NOT** pushed to Git (check your `.gitignore`).
- [ ] **Import Project in Vercel**:
  - Click **Add New** -> **Project**.
  - Select your `bayflow` repository.

---

## 🔒 Phase 2: Environment Variables
Go to **Project Settings** -> **Environment Variables** in Vercel and check off each one as you add it.

### 🔑 App Config
- [ ] `NEXT_PUBLIC_BASE_URL` - Set to `https://<your-app>.vercel.app`

### 🔥 Firebase (Client)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID`

### 👑 Firebase Admin (Server)
- [ ] `FIREBASE_ADMIN_PROJECT_ID`
- [ ] `FIREBASE_ADMIN_CLIENT_EMAIL`
- [ ] `FIREBASE_ADMIN_PRIVATE_KEY` (Wrap in quotes if it gives errors)

### 🛡️ Security Keys (Action Required!)
- [ ] `ENCRYPTION_KEY` - **Generate a key!** Run this command locally and paste the output:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] `CRON_SECRET` - Create a strong random string and paste it here.

### 💳 Stripe & Payments
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`

### 📱 Twilio (SMS)
- [ ] `TWILIO_ACCOUNT_SID`
- [ ] `TWILIO_AUTH_TOKEN`
- [ ] `TWILIO_MESSAGING_SERVICE_SID`

### 📧 Resend (Emails)
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`

### 🏛️ Business Settings
- [ ] `GARAGE_NAME`
- [ ] `GARAGE_PHONE`
- [ ] `GOOGLE_REVIEW_LINK`
- [ ] `GARAGE_TIMEZONE` (e.g., `Europe/London`)

### 🚗 Vehicle Lookup
- [ ] `UK_VEHICLE_API_KEY`
- [ ] `UK_VEHICLE_API_URL`

---

## ⏰ Phase 3: Deploy & Config
- [ ] **Click Deploy** in Vercel and wait for the build to finish.
- [ ] **Verify Cron Job**:
  - Go to **Settings** -> **Cron Jobs**.
  - Verify that `/api/cron/mot-reminders` is listed.

---

## 🛠️ Phase 4: External Service Approval
- [ ] **Update Firebase Authorized Domains**:
  - Firebase Console -> Auth -> Settings -> Authorized Domains.
  - Add your Vercel URL.
- [ ] **Update Google OAuth Redirects**:
  - Add your Vercel URL to authorized origins/redirects if using Google Sign-In.
- [ ] **Update Stripe Webhooks**:
  - Point your Stripe webhook endpoint to `https://<your-app>.vercel.app/api/webhooks/stripe`.
