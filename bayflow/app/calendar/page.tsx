"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

function CalendarContent() {
    const [isConnected, setIsConnected] = useState<boolean | null>(null);

    useEffect(() => {
        // Check if connected and load events side-by-side
        const loadStatusAndEvents = async () => {
            // For the sake of the UI demo, we will bypass the actual API check 
            // and just show the beautiful UI layout. In production this would fetch.
            setIsConnected(true);
        };

        loadStatusAndEvents();
    }, []);

    return (
        <AppLayout>
            {isConnected === false ? (
                <div className="flex flex-col items-center justify-center p-12 mt-12">
                    <Card className="max-w-md w-full border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] rounded-2xl overflow-hidden">
                        <CardContent className="flex flex-col items-center p-10 text-center space-y-6 bg-white">
                            <div className="rounded-full bg-blue-50 text-blue-500 p-6 mb-2">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Not Connected</h2>
                            <p className="text-sm text-slate-500 font-medium pb-2">Connect your Google Calendar in Settings to view and sync your schedule here interactively.</p>
                            <Button onClick={() => window.location.href = '/settings'} className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 transition-all">Go to Settings</Button>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex flex-col gap-8 max-w-[1440px] mx-auto pb-8 font-sans">
                    {/* Page Header */}
                    <div className="flex flex-wrap justify-between items-end gap-4 px-2">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Calendar</h1>
                            <p className="text-base font-normal text-slate-500">Manage appointments and shop capacity</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
                                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                </button>
                                <span className="px-4 text-sm font-bold text-slate-700">Oct 12 - 18, 2026</span>
                                <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </div>
                            <button className="flex items-center gap-2 bg-primary text-white px-6 h-12 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                <span>New Booking</span>
                            </button>
                        </div>
                    </div>

                    {/* Calendar Content */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                        {/* Calendar View Selector component */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <div className="flex bg-slate-100 p-1 rounded-lg">
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition">Day</button>
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md bg-white text-primary shadow-sm">Week</button>
                                <button className="px-4 py-1.5 text-xs font-semibold rounded-md text-slate-500 hover:text-slate-700 transition">Month</button>
                            </div>
                            <div className="flex items-center gap-4 hidden sm:flex">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirmed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Provisional</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">In Progress</span>
                                </div>
                            </div>
                        </div>

                        {/* Grid Header */}
                        <div className="grid grid-cols-[80px_repeat(5,1fr)] bg-slate-50 border-b border-slate-100">
                            <div className="p-4"></div>
                            <div className="p-4 text-center border-l border-slate-100">
                                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Mon</span>
                                <span className="text-lg font-black text-slate-700">12</span>
                            </div>
                            <div className="p-4 text-center border-l border-slate-100">
                                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Tue</span>
                                <span className="text-lg font-black text-slate-700">13</span>
                            </div>
                            <div className="p-4 text-center border-l border-slate-100 bg-primary/5">
                                <span className="block text-[10px] uppercase tracking-wider font-bold text-primary">Wed</span>
                                <span className="text-lg font-black text-primary">14</span>
                            </div>
                            <div className="p-4 text-center border-l border-slate-100">
                                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Thu</span>
                                <span className="text-lg font-black text-slate-700">15</span>
                            </div>
                            <div className="p-4 text-center border-l border-slate-100">
                                <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400">Fri</span>
                                <span className="text-lg font-black text-slate-700">16</span>
                            </div>
                        </div>

                        {/* Grid Body */}
                        <div className="relative overflow-x-auto min-w-[800px]">
                            {/* Time Rows */}
                            {[8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((hour) => (
                                <div key={hour} className="grid grid-cols-[80px_repeat(5,1fr)] border-b border-slate-50 h-24 last:border-0">
                                    <div className="flex justify-center items-start pt-2 text-[11px] font-bold text-slate-400">
                                        {hour.toString().padStart(2, '0')}:00
                                    </div>
                                    <div className="border-l border-slate-50 relative"></div>
                                    <div className="border-l border-slate-50 relative"></div>
                                    <div className="border-l border-slate-50 relative bg-primary/[0.02]"></div>
                                    <div className="border-l border-slate-50 relative"></div>
                                    <div className="border-l border-slate-50 relative"></div>
                                </div>
                            ))}

                            {/* Static Appointments Overlay (Positioned Absolutely over the Grid) */}

                            {/* Mon 09:15 - 10:45 */}
                            <div className="absolute top-[115px] left-[80px] w-[calc(20%_-_16px)] mx-2 h-[144px] bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 overflow-hidden">
                                <p className="text-[10px] font-black text-emerald-700 uppercase">WX68 ZXY</p>
                                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">Alice Johnson</p>
                                <p className="text-[9px] font-medium text-slate-500 mt-1">09:15 - 10:45</p>
                            </div>

                            {/* Tue 10:00 - 11:00 */}
                            <div className="absolute top-[192px] left-[calc(80px_+_20%)] w-[calc(20%_-_16px)] mx-2 h-[96px] bg-amber-500/10 border-l-4 border-amber-500 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 overflow-hidden">
                                <p className="text-[10px] font-black text-amber-700 uppercase">KP70 LMA</p>
                                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">David Smith</p>
                                <p className="text-[9px] font-medium text-slate-500 mt-1">10:00 - 11:00</p>
                            </div>

                            {/* Wed 11:30 - 13:30 (In Progress) */}
                            <div className="absolute top-[336px] left-[calc(80px_+_40%)] w-[calc(20%_-_16px)] mx-2 h-[192px] bg-primary/10 border-l-4 border-primary rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 overflow-hidden">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-tighter">GJ71 KLP</p>
                                </div>
                                <p className="text-xs font-bold text-slate-800 truncate">Bob Smith</p>
                                <p className="text-[9px] font-medium text-slate-500 mt-1">11:30 - 13:30 • Full Service</p>
                            </div>

                            {/* Thu 14:00 - 16:30 */}
                            <div className="absolute top-[576px] left-[calc(80px_+_60%)] w-[calc(20%_-_16px)] mx-2 h-[240px] bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 overflow-hidden">
                                <p className="text-[10px] font-black text-emerald-700 uppercase">RE20 NOP</p>
                                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">Chris Gale</p>
                                <p className="text-[9px] font-medium text-slate-500 mt-1">14:00 - 16:30</p>
                            </div>

                            {/* Fri 14:15 - 15:45 */}
                            <div className="absolute top-[600px] left-[calc(80px_+_80%)] w-[calc(20%_-_16px)] mx-2 h-[144px] bg-emerald-500/10 border-l-4 border-emerald-500 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 overflow-hidden">
                                <p className="text-[10px] font-black text-emerald-700 uppercase">BV22 GHJ</p>
                                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">Sarah Miller</p>
                                <p className="text-[9px] font-medium text-slate-500 mt-1">14:15 - 15:45</p>
                            </div>

                            {/* Fri 16:15 - 17:45 */}
                            <div className="absolute top-[792px] left-[calc(80px_+_80%)] w-[calc(20%_-_16px)] mx-2 h-[144px] bg-amber-500/10 border-l-4 border-amber-500 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer z-10 overflow-hidden">
                                <p className="text-[10px] font-black text-amber-700 uppercase">XY69 RTF</p>
                                <p className="text-xs font-bold text-slate-800 truncate mt-0.5">Mark Thompson</p>
                                <p className="text-[9px] font-medium text-slate-500 mt-1">16:15 - 17:45</p>
                            </div>

                            {/* Current Time Indicator (e.g. Wed 12:30) */}
                            <div className="absolute top-[432px] left-[80px] right-0 h-px bg-primary z-20 pointer-events-none flex items-center">
                                <div className="w-2 h-2 rounded-full bg-primary -ml-1"></div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Capacity</p>
                            <div className="flex items-end justify-between">
                                <h3 className="text-3xl font-black text-slate-900">82%</h3>
                                <span className="text-emerald-500 text-xs font-bold flex items-center mb-1">
                                    <svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
                                    4%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4">
                                <div className="bg-primary h-full rounded-full w-[82%]"></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Bookings</p>
                            <h3 className="text-3xl font-black text-slate-900">42</h3>
                            <p className="text-xs font-medium text-slate-500 mt-2">12 pending confirmation</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)]">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Daily Average</p>
                            <h3 className="text-3xl font-black text-slate-900">8.4</h3>
                            <p className="text-xs font-medium text-slate-500 mt-2">Target: 10 per day</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Shop Efficiency</p>
                                <h3 className="text-3xl font-black text-slate-900">94%</h3>
                            </div>
                            <div className="flex gap-1.5 mt-4">
                                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-emerald-500 rounded-full"></div>
                                <div className="h-1.5 flex-1 bg-slate-100 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}

export default function CalendarPage() {
    return (
        <AuthProvider>
            <CalendarContent />
        </AuthProvider>
    );
}

