"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Perfect for mobile mechanics.",
    price: "£29",
    features: ["1 User", "Up to 50 jobs/mo", "Basic Reports", "SMS Notifications"],
    cta: "Downgrade",
    current: false,
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For growing workshops.",
    price: "£59",
    features: ["5 Users", "Unlimited Jobs", "Advanced Analytics", "Priority Support", "Custom SMS Templates"],
    cta: "Current Plan",
    current: true,
    highlighted: true,
  },
  {
    name: "Multi-Site",
    description: "For chains and large centres.",
    price: "£149",
    features: ["Unlimited Users", "Multiple Locations", "API Access", "Dedicated Account Manager"],
    cta: "Contact Sales",
    current: false,
    highlighted: false,
  },
];

export default function BillingPage() {
  return (
    <AuthProvider>
      <BillingContent />
    </AuthProvider>
  );
}

function BillingContent() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppLayout>
        <div className="max-w-[1440px] mx-auto w-full pb-8 font-sans">
          {/* Page Header */}
          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Billing & Invoices</h1>
            <p className="text-base text-slate-500 font-normal">Manage your subscription and billing details.</p>
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl border shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col ${plan.highlighted ? 'border-primary border-2 shadow-primary/10' : 'border-slate-200'
                  }`}
              >
                {plan.highlighted && (
                  <div className="absolute top-0 right-0 -mt-0 mr-0">
                    <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-xl">Popular</span>
                  </div>
                )}

                <div className="px-8 pt-8 pb-6">
                  <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{plan.description}</p>
                  <div className="mt-6">
                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                    <span className="text-sm font-medium text-slate-400 ml-1">/mo</span>
                  </div>
                </div>

                <div className="px-8 pb-6 flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="px-8 pb-8">
                  {plan.current ? (
                    <button className="w-full h-12 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                      {plan.cta}
                    </button>
                  ) : (
                    <button className="w-full h-12 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all">
                      {plan.cta}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
            </div>
            <div className="px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-slate-100 p-3 rounded-xl">
                    <span className="font-black text-slate-700 text-sm tracking-wider">VISA</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Ending in 4242</p>
                    <p className="text-xs text-slate-500 font-medium">Expires 12/25</p>
                  </div>
                </div>
                <button className="text-primary text-sm font-bold hover:underline transition-colors">Update</button>
              </div>
            </div>
          </div>

          {/* Billing History */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden mt-6">
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Billing History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { date: "Mar 01, 2026", amount: "£59.00", status: "Paid" },
                    { date: "Feb 01, 2026", amount: "£59.00", status: "Paid" },
                    { date: "Jan 01, 2026", amount: "£59.00", status: "Paid" },
                  ].map((inv, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-8 py-4 text-sm font-medium text-slate-700">{inv.date}</td>
                      <td className="px-8 py-4 text-sm font-bold text-slate-900">{inv.amount}</td>
                      <td className="px-8 py-4">
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <button className="text-primary text-xs font-bold hover:underline">Download PDF</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
