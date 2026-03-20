
"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueueBoard } from "@/components/queue/QueueBoard";

export default function QueuePage() {
  return (
    <AuthProvider>
      <AppLayout>
        <div className="h-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Live Job Queue</h1>
            <div className="text-sm text-gray-500 hidden sm:block">
              Drag and drop jobs to update status
            </div>
          </div>
          <QueueBoard />
        </div>
      </AppLayout>
    </AuthProvider>
  );
}
