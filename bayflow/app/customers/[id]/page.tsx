"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { store } from "@/lib/store";
import { Customer, Job } from "@/types";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Phone, Calendar } from "lucide-react";
import Link from "next/link";

function CustomerDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [history, setHistory] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const customers = await store.getCustomers();
      const foundCustomer = customers.find((c) => c.id === id);

      if (foundCustomer) {
        setCustomer(foundCustomer);
        const allJobs = await store.getJobs();
        const customerJobs = allJobs.filter(j => j.customerId === id);
        setHistory(customerJobs);
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </AppLayout>
  );

  if (!customer) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-slate-500 font-medium">Customer not found</p>
        <button onClick={() => router.back()} className="text-primary font-bold text-sm mt-4 hover:underline">Go Back</button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="max-w-[1200px] mx-auto w-full pb-12 font-sans">
        {/* Back + Name */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{customer.name}</h1>
            <p className="text-sm text-slate-500">Customer ID: {customer.id.slice(0, 8)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column — Contact Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Contact Info</h2>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Phone className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-bold text-slate-900 text-sm">{customer.phone}</span>
                </div>
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <span className="text-xs font-black text-primary">@</span>
                    </div>
                    <span className="text-sm text-slate-700">{customer.email}</span>
                  </div>
                )}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 font-medium">Member since {new Date(customer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Summary</h2>
              </div>
              <div className="px-6 py-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Jobs</span>
                  <span className="text-lg font-black text-slate-900">{history.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicles</span>
                  <span className="text-lg font-black text-slate-900">{customer.vehicleIds.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column — Job History */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900">Job History</h2>
                <span className="text-xs font-bold text-slate-400">{history.length} total</span>
              </div>
              <div className="divide-y divide-slate-50">
                {history.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-slate-500 font-medium text-sm">No previous jobs found.</p>
                  </div>
                ) : (
                  history.map((job) => {
                    const statusColor =
                      job.status === 'ready' || job.status === 'collected'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : job.status === 'in_bay'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : job.status === 'awaiting_approval'
                            ? 'bg-amber-50 text-amber-600 border-amber-100'
                            : 'bg-slate-100 text-slate-600 border-slate-200';

                    return (
                      <Link href={`/jobs/${job.id}`} key={job.id} className="block group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 hover:bg-slate-50/80 transition-colors">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-primary text-sm tracking-tight">{job.vehicle.registration}</span>
                              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md uppercase">{job.type}</span>
                            </div>
                            <p className="text-xs text-slate-600 font-medium">{job.vehicle.make} {job.vehicle.model}</p>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border ${statusColor}`}>
                              {job.status.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function CustomerDetailPage() {
  return (
    <AuthProvider>
      <CustomerDetailContent />
    </AuthProvider>
  );
}
