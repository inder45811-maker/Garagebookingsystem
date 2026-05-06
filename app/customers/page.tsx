
"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { store } from "@/lib/store";
import { Customer } from "@/types";
import Link from "next/link";
import { Search } from "lucide-react";

function CustomersContent() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function loadCustomers() {
      const data = await store.getCustomers();
      setCustomers(data);
      setLoading(false);
    }
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="max-w-[1440px] mx-auto w-full pb-8 font-sans">
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Customers</h1>
            <p className="text-base text-slate-500 font-normal">Manage client relationships and vehicle history</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm w-full sm:w-auto hidden md:flex">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Export
            </button>
            <button className="flex items-center justify-center rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold shadow-sm shadow-primary/20 hover:opacity-90 transition-opacity w-full sm:w-auto">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              New Customer
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm font-medium">Total Customers</p>
              <span className="text-primary bg-primary/10 p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </span>
            </div>
            <p className="text-slate-900 tracking-tight text-3xl font-bold leading-tight">1,248</p>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              <span>+12.5%</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm font-medium">Active this month</p>
              <span className="text-primary bg-primary/10 p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </span>
            </div>
            <p className="text-slate-900 tracking-tight text-3xl font-bold leading-tight">142</p>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              <span>+4%</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm font-medium">New this week</p>
              <span className="text-primary bg-primary/10 p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
              </span>
            </div>
            <p className="text-slate-900 tracking-tight text-3xl font-bold leading-tight">18</p>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              <span>+2 today</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center">
              <p className="text-slate-500 text-sm font-medium">Avg Return Rate</p>
              <span className="text-primary bg-primary/10 p-1.5 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              </span>
            </div>
            <p className="text-slate-900 tracking-tight text-3xl font-bold leading-tight">64%</p>
            <div className="flex items-center gap-1 text-slate-500 text-xs font-semibold">
              <span>Maintained</span>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 text-center text-slate-500 font-medium">Loading customers...</div>
            ) : (
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider">Vehicles File</th>
                    <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-slate-600 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                        No customers found.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                            </div>
                            <div>
                              <Link href={`/customers/${customer.id}`} className="text-slate-900 font-semibold text-sm hover:text-primary transition-colors">
                                {customer.name}
                              </Link>
                              <p className="text-slate-400 text-xs">Customer ID: {customer.id.slice(0, 5)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <p className="text-slate-600 text-sm">{customer.email || "No email provided"}</p>
                            <p className="text-slate-400 text-xs">{customer.phone}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {customer.vehicleIds.length > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                              {customer.vehicleIds.length} Vehicle(s)
                            </span>
                          ) : (
                            <span className="text-slate-400 text-xs lowercase">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-slate-400 hover:text-primary transition-colors p-2 rounded-lg hover:bg-slate-100">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Placeholder */}
          {!loading && filteredCustomers.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500 font-medium">Showing top {Math.min(filteredCustomers.length, 10)} customers</p>
              <div className="flex items-center gap-1">
                <button className="flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button className="flex w-8 h-8 items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
                <button className="flex w-8 h-8 items-center justify-center rounded-lg border border-transparent text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors">2</button>
                <button className="flex w-8 h-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default function CustomersPage() {
  return (
      <CustomersContent />
  );
}
