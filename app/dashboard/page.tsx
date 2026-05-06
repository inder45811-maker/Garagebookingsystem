"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { store } from "@/lib/store";
import { Job } from "@/types";

function DashboardContent() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    async function fetchJobs() {
      const data = await store.getJobs();
      setJobs(data);
      setLoadingJobs(false);
    }
    fetchJobs();
  }, []);

  if (isLoading || loadingJobs) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate stats
  const waitingCount = jobs.filter(j => j.status === 'waiting').length;
  const inProgressCount = jobs.filter(j => j.status === 'in_bay' || j.status === 'awaiting_approval').length;
  const readyCount = jobs.filter(j => j.status === 'ready').length;

  // Dummy average time calculation
  const avgWaitTime = "2.1h";

  return (
    <AppLayout>
      {/* Dashboard Content */}
      <div className="p-6 md:p-10 space-y-8 font-sans">
        {/* Overview Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Analytics Overview</h1>
            <p className="text-slate-500 mt-1">Real-time performance metrics for Bayflow Automotive.</p>
          </div>
          <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <span>Last 30 days</span>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Waiting */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
            </div>
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">{waitingCount}</span>
            <span className="text-slate-400 text-sm font-medium tracking-wider">Total Waiting</span>
            <div className="mt-6 flex items-center gap-1 text-emerald-500 text-sm font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
              <span>12%</span>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
            </div>
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">{inProgressCount}</span>
            <span className="text-slate-400 text-sm font-medium tracking-wider">In Progress</span>
            <div className="mt-6 flex items-center gap-1 text-emerald-500 text-sm font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
              <span>112.71%</span>
            </div>
          </div>

          {/* Ready */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">{readyCount}</span>
            <span className="text-slate-400 text-sm font-medium tracking-wider">Ready Jobs</span>
            <div className="mt-6 flex items-center gap-1 text-rose-500 text-sm font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
              <span>24.2%</span>
            </div>
          </div>

          {/* Avg. Wait Time */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11"></path></svg>
            </div>
            <span className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">{avgWaitTime}</span>
            <span className="text-slate-400 text-sm font-medium tracking-wider">Avg. Wait Time</span>
            <div className="mt-6 flex items-center gap-1 text-emerald-500 text-sm font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg>
              <span>112.71%</span>
            </div>
          </div>
        </div>

        {/* Lower Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 pt-8">
          {/* Recent Jobs */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-slate-800">Recent Jobs</h3>
              <button
                onClick={() => router.push('/queue')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                View all <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-3 min-h-[250px] overflow-y-auto">
              {jobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(`/job/${job.id}`)}
                  className="group flex items-center justify-between p-4 rounded-xl border border-slate-100/80 bg-slate-50/30 hover:bg-blue-50/50 hover:border-blue-100 transition-all cursor-pointer shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-blue-100 group-hover:text-blue-700 group-hover:border-blue-100 transition-colors shadow-sm">
                      {job.vehicle.registration.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm tracking-tight">{job.vehicle.registration}</h4>
                      <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[120px] sm:max-w-[180px]">
                        {job.vehicle.make} {job.vehicle.model}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                      ${job.status === 'waiting' ? 'bg-blue-50 text-blue-700 border border-blue-200/50' :
                        job.status === 'in_bay' ? 'bg-purple-50 text-purple-700 border border-purple-200/50' :
                          job.status === 'ready' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' :
                            job.status === 'awaiting_approval' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' :
                              'bg-slate-50 text-slate-700 border border-slate-200/50'}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {new Date(job.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}

              {jobs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 py-10">
                  <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  <span className="text-sm font-medium">No recent jobs</span>
                </div>
              )}
            </div>
          </div>

          {/* Jobs Completed Bar Chart */}
          <div className="lg:col-span-3 bg-white p-6 md:p-10 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-x-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Activity Growth</h3>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <svg className="w-6 h-6 cursor-pointer hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>
                <svg className="w-6 h-6 cursor-pointer hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
              </div>
            </div>

            <div className="flex items-center mb-8">
              <span className="w-4 h-4 bg-primary rounded bg-blue-500 mr-2"></span>
              <span className="text-sm font-semibold mr-1">12.8k</span>
              <span className="text-sm text-gray-500 mr-4">new completed</span>
              <span className="w-4 h-4 bg-gray-200 rounded mr-2"></span>
            </div>


            <div className="h-48 md:h-64 flex items-end justify-between gap-2 md:gap-4 relative">
              {/* Y Axis */}
              <div className="absolute left-0 top-0 bottom-6 -ml-8 flex flex-col justify-between text-xs text-gray-400">
                <span>10k</span>
                <span>8k</span>
                <span>6k</span>
                <span>4k</span>
                <span>2k</span>
              </div>
              {/* Goal Line */}
              <div className="absolute top-1/2 left-0 right-0 border-t border-dashed border-blue-300 pointer-events-none">
                <span className="absolute right-0 -mr-10 -mt-2 text-[10px] font-bold text-gray-400 hidden md:block">GOAL</span>
              </div>

              {[
                { day: 'Mon', h: '60%', active: false },
                { day: 'Tue', h: '80%', active: true },
                { day: 'Wed', h: '50%', active: false },
                { day: 'Thu', h: '65%', active: false },
                { day: 'Fri', h: '95%', active: true },
                { day: 'Sat', h: '40%', active: false },
                { day: 'Sun', h: '30%', active: false },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 flex-1 h-full justify-end z-10 w-full group relative">
                  {/* Tooltip on active bar */}
                  {item.active && i === 4 && (
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 bg-slate-800 text-white text-xs p-3 rounded shadow-lg pointer-events-none z-20 hidden md:block">
                      With <span className="font-bold">22.8%</span> growth rate we are steadily growing our following.
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                    </div>
                  )}
                  <div className={`w-6 md:w-8 ${item.active ? 'bg-blue-500' : 'bg-gray-200'} rounded-t-sm transition-all hover:opacity-80`} style={{ height: item.h }}></div>
                  <span className="text-[10px] md:text-xs font-bold text-slate-400">-</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function Dashboard() {
  return (
      <DashboardContent />
  );
}
