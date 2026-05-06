"use client";

import Link from "next/link";
import { PublicNavbar } from "@/components/marketing/PublicNavbar";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { ArrowRight, CheckCircle2, XCircle, Search, CreditCard, CalendarClock, Zap } from "lucide-react";

function LandingContent() {
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans">
            <PublicNavbar />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="relative px-4 py-24 md:py-36 overflow-hidden bg-slate-50">
                    <div className="container mx-auto max-w-7xl z-10 relative grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                                <Zap className="h-3.5 w-3.5" />
                                Now with DVLA Integration
                            </div>
                            <h1 className="text-4xl md:text-6xl leading-[1.1] font-extrabold tracking-tight text-slate-900">
                                Turn Garage Chaos into <span className="text-primary">Clockwork.</span>
                            </h1>
                            <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-lg">
                                The all-in-one queue, booking, and payment system built specifically for
                                independent garages, auto electricians, and detailers.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row gap-4">
                                <Link href="/signup">
                                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white h-14 px-8 rounded-full font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                                        Get Started <ArrowRight className="h-5 w-5" />
                                    </button>
                                </Link>
                                <Link href="/features">
                                    <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 h-14 px-8 rounded-full font-bold text-base hover:bg-slate-50 transition-colors shadow-sm">
                                        See How It Works
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Dashboard Mockup */}
                        <div className="w-full rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-white aspect-[16/10] flex items-center justify-center p-8">
                            <div className="w-full h-full bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400">
                                <span className="font-bold text-lg">[Application Dashboard Mockup]</span>
                            </div>
                        </div>
                    </div>

                    {/* Decorative gradient */}
                    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary/30 to-blue-400/30 opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}></div>
                    </div>
                </section>

                {/* Trust Banner */}
                <div className="border-y border-slate-100 bg-white py-10">
                    <p className="text-center font-bold text-slate-400 uppercase tracking-[0.2em] text-[10px] mb-6">
                        Trusted by independent specialists and mobile mechanics across the UK
                    </p>
                    <div className="flex justify-center flex-wrap gap-10 opacity-30 grayscale">
                        <span className="font-bold text-2xl">MOTO<span className="text-primary">PREP</span></span>
                        <span className="font-bold text-2xl">Auto<span className="italic">Elec</span> Ltd</span>
                        <span className="font-bold text-2xl font-serif">A&B Diagnostics</span>
                        <span className="font-semibold text-2xl">LCH Detailers</span>
                    </div>
                </div>

                {/* Pain Point vs Solution */}
                <section className="py-24 bg-slate-50">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Stop managing paper diaries and missed calls.</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* The Old Way */}
                            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm opacity-80">
                                <h3 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">The Old Way</h3>
                                <ul className="space-y-5">
                                    <li className="flex gap-3 text-slate-600 text-sm leading-relaxed"><XCircle className="text-rose-500 shrink-0 mt-0.5 h-5 w-5" /> Losing track of vehicles on the forecourt</li>
                                    <li className="flex gap-3 text-slate-600 text-sm leading-relaxed"><XCircle className="text-rose-500 shrink-0 mt-0.5 h-5 w-5" /> Manually typing VIN numbers and details</li>
                                    <li className="flex gap-3 text-slate-600 text-sm leading-relaxed"><XCircle className="text-rose-500 shrink-0 mt-0.5 h-5 w-5" /> End-of-day cash reconciliation headaches</li>
                                    <li className="flex gap-3 text-slate-600 text-sm leading-relaxed"><XCircle className="text-rose-500 shrink-0 mt-0.5 h-5 w-5" /> Missing out on repeat MOT bookings</li>
                                </ul>
                            </div>

                            {/* The BayFlow Way */}
                            <div className="bg-primary text-white p-8 rounded-2xl shadow-xl border border-primary/80 relative overflow-hidden">
                                <div className="absolute top-0 right-6 -mt-0 mr-0">
                                    <span className="bg-white text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-b-xl">The Upgrade</span>
                                </div>
                                <h3 className="text-xl font-bold mb-6 pb-4 border-b border-blue-400/30">The BayFlow Way</h3>
                                <ul className="space-y-5">
                                    <li className="flex gap-3 text-blue-50 text-sm leading-relaxed"><CheckCircle2 className="text-white shrink-0 mt-0.5 h-5 w-5" /> Live drag-and-drop mechanic queues</li>
                                    <li className="flex gap-3 text-blue-50 text-sm leading-relaxed"><CheckCircle2 className="text-white shrink-0 mt-0.5 h-5 w-5" /> Instant DVLA plate lookup integration</li>
                                    <li className="flex gap-3 text-blue-50 text-sm leading-relaxed"><CheckCircle2 className="text-white shrink-0 mt-0.5 h-5 w-5" /> One-tap physical Stripe Terminal payments</li>
                                    <li className="flex gap-3 text-blue-50 text-sm leading-relaxed"><CheckCircle2 className="text-white shrink-0 mt-0.5 h-5 w-5" /> Automated 11-month MOT SMS Reminders</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Grid */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto max-w-7xl px-4">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Everything you need under the hood.</h2>
                            <p className="mt-4 text-base text-slate-600 leading-relaxed">BayFlow replaces four different subscriptions with one unified, mechanic-first dashboard.</p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                { icon: <ArrowRight className="h-6 w-6 text-primary" />, title: "Live Job Tracking", desc: 'Drag and drop jobs from "Waiting" to "Ready" instantly showing your mechanics what to tackle next.' },
                                { icon: <Search className="h-6 w-6 text-primary" />, title: "DVLA Lookup", desc: "Type in the registration plate, and instantly autofill the exact Make, Model, Color, and Year on the job card." },
                                { icon: <CreditCard className="h-6 w-6 text-primary" />, title: "Terminal Payments", desc: "Push the invoice total direct to a physical Stripe card machine on your desk for a seamless tap-to-pay checkout." },
                                { icon: <CalendarClock className="h-6 w-6 text-primary" />, title: "Automated MOTs", desc: "BayFlow spots jobs that are 11-months old and texts the customer automatically asking them to re-book." },
                            ].map((f, i) => (
                                <div key={i} className="p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg hover:border-slate-200 transition-all group">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                                        {f.icon}
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-3">{f.title}</h4>
                                    <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-gradient-to-r from-primary to-blue-700 py-20 text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">Ready to modernize your reception desk?</h2>
                    <Link href="/signup">
                        <button className="bg-white text-primary hover:bg-slate-50 h-14 px-10 rounded-full text-base font-bold shadow-lg transition-all">
                            Start your 14-Day Free Trial
                        </button>
                    </Link>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

export default function LandingPage() {
    return (
            <LandingContent />
    );
}
