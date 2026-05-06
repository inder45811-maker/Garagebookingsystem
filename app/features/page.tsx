"use client";

import Link from "next/link";
import { PublicNavbar } from "@/components/marketing/PublicNavbar";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { CheckCircle2, ArrowRight } from "lucide-react";

function FeaturesContent() {
    const features = [
        {
            badge: "1. Live Job Tracking",
            title: "The Modern Reception Dashboard",
            desc: "Ditch the paper diaries and whiteboard markers. Our drag-and-drop Kanban queue puts every vehicle into a clear, live traffic lane.",
            items: [
                'See instantly which cars are "Waiting", "In Bay", or "Ready"',
                "Mechanics can claim tickets direct from their phones",
                "Log internal notes and estimated completion times",
            ],
            mockLabel: "Queue Management UI",
        },
        {
            badge: "2. Stripe Terminal",
            title: "Integrated Card Machines",
            desc: "Stop manually typing amounts into generic card readers. BayFlow connects directly to intelligent Stripe Terminal hardware.",
            items: [
                "Push the exact invoice amount straight to the physical reader",
                'Auto-marks the job as "Paid" instantly upon successful tap',
                "No reconciliation errors at the end of the day",
            ],
            mockLabel: "Stripe UI / Reader Card",
            reversed: true,
        },
        {
            badge: "3. Automated SMS",
            title: "Customer Communication",
            desc: "Keep your customers in the loop without tying up your phone lines. Send automated updates and gather social proof effortlessly.",
            items: [
                'Send "Your vehicle is ready" texts with one click',
                "Automatically text them your Google Maps link 2 hours after paying",
                "Build 5-star reviews on autopilot",
            ],
            mockLabel: "SMS Inbox / Phone",
        },
        {
            badge: "4. Revenue Expansion",
            title: "Growth Tools",
            desc: "Don't just manage the work you have—use BayFlow to actively generate your next month's calendar.",
            items: [
                "Share your public Booking Portal link on your website",
                "Approve or Reject incoming online appointments instantly",
                "System automatically intercepts 11-month old jobs to send MOT Reminders",
            ],
            mockLabel: "Booking Form & DVLA Lookup",
            reversed: true,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans">
            <PublicNavbar />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-gradient-to-r from-primary to-blue-700 py-24 text-white text-center px-4">
                    <div className="container mx-auto max-w-4xl">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">Built for the Workshop Floor</h1>
                        <p className="text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
                            Explore the four core pillars of BayFlow that help independent garages operate like modern dealerships without the enterprise price tag.
                        </p>
                    </div>
                </section>

                <section className="py-24">
                    <div className="container mx-auto max-w-6xl px-4 space-y-24">
                        {features.map((f, i) => (
                            <div key={i} className={`flex flex-col ${f.reversed ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12`}>
                                <div className="flex-1 space-y-6">
                                    <span className="inline-block bg-primary/10 text-primary font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">
                                        {f.badge}
                                    </span>
                                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">{f.title}</h2>
                                    <p className="text-base text-slate-600 leading-relaxed">{f.desc}</p>
                                    <ul className="space-y-4 pt-2">
                                        {f.items.map((item, j) => (
                                            <li key={j} className="flex items-start gap-3 text-sm text-slate-700 leading-relaxed">
                                                <CheckCircle2 className="text-primary mt-0.5 shrink-0 h-5 w-5" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex-1 w-full bg-white rounded-2xl shadow-xl border border-slate-200 aspect-[16/10] flex items-center justify-center p-8">
                                    <div className="w-full h-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400">
                                        <span className="font-bold text-lg">{f.mockLabel}</span>
                                        <span className="text-xs mt-1">Mockup Placeholder</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-slate-50 border-t border-slate-100 py-20 text-center px-4">
                    <div className="max-w-2xl mx-auto space-y-6">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Experience the difference today.</h2>
                        <p className="text-base text-slate-600 leading-relaxed">Join the growing network of UK garages replacing their chaotic whiteboards with BayFlow.</p>
                        <Link href="/signup" className="inline-block mt-4">
                            <button className="bg-primary text-white hover:bg-primary/90 h-14 px-10 rounded-full text-base font-bold shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
                                Start your 14-Day Free Trial <ArrowRight className="h-5 w-5" />
                            </button>
                        </Link>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

export default function FeaturesPage() {
    return (
            <FeaturesContent />
    );
}
