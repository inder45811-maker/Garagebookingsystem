
# BayFlow - Garage Management System

BayFlow is an Android-first responsive web app for independent garages, tyre shops, car detailers, and mobile mechanics to manage customer check-ins, live job queues, and service updates.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + `clsx` + `tailwind-merge`
- **Drag & Drop:** `@hello-pangea/dnd`
- **Icons:** `lucide-react`
- **Charts:** `recharts`
- **Backend (Mocked for MVP):** In-memory store (simulating Firebase)

## Features

- **Responsive Dashboard:** Overview of waiting cars, active jobs, and daily stats.
- **Live Job Queue:** Kanban-style drag-and-drop board for managing job status (Waiting, In Bay, Ready, etc.).
- **Quick Check-in:** Reception-friendly form for adding new jobs and customers.
- **Customer Management:** View customer history and contact details.
- **Job Details:** Manage internal notes, quotes, and job status.
- **Admin Tools:** Analytics, settings, and billing placeholders.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```

3.  **Open in Browser:**
    Navigate to [http://localhost:3000](http://localhost:3000).

## Database Schema (Concept)

### `users` collection
- `id`: string
- `email`: string
- `role`: 'admin' | 'staff'
- `businessId`: string

### `customers` collection
- `id`: string
- `name`: string
- `phone`: string
- `email`: string
- `vehicleIds`: string[]
- `businessId`: string

### `jobs` collection
- `id`: string
- `customerId`: string
- `vehicle`: { reg, make, model, vin }
- `status`: 'waiting' | 'in_bay' | 'ready' | ...
- `description`: string
- `internalNotes`: string
- `createdAt`: timestamp

## Firebase Setup (For Production)

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Enable **Authentication** (Email/Password).
3. Enable **Firestore Database**.
4. Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
   ...
   ```
5. Update `lib/store.ts` to use Firestore methods instead of the in-memory mock store.

## Mobile Optimization

The app is designed with large touch targets (min 44px) and a bottom navigation bar for mobile devices, making it perfect for use on tablets in the workshop or phones on the go.
