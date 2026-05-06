"use client";

import Link from "next/link";
import { PublicNavbar } from "@/components/marketing/PublicNavbar";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function PricingContent() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        {
            q: "Do I need to buy a Stripe card machine?",
            a: "Yes, to use the integrated terminal feature, you will need to purchase a compatible Stripe terminal (like the BBPOS WisePOS E) directly from your Stripe dashboard. BayFlow does not mark up these machines."
        },
        {
            q: "Is there a long-term contract?",
            a: "No. BayFlow is a month-to-month subscription. You can cancel or change your plan at any time directly from the billing dashboard."
        },
        {
            q: "Are text messages included?",
            a: "Pro and Multi-Site plans include an allowance of 500 SMS messages per month (via Twilio integration). Additional messages are billed at standard Twilio rates."
        },
        {
            q: "Can I use BayFlow for just MOT queues?",
            a: 'Absolutely! Many of our garages use the Starter plan purely to digitize their whiteboard, dragging vehicles from "Waiting" to "In Bay" to "Collected".'
        }
    ];

    const plans = [
        {
            name: "Starter",
            desc: "Perfect for small garages digitizing their whiteboard.",
            price: "£49",
            features: ["Live drag-and-drop job queue", "Up to 2 staff accounts", "Manual cash/card checkout logging", "Basic vehicle tracking"],
            cta: "Start 14-Day Free Trial",
            highlighted: false,
        },
        {
            name: "Pro",
            desc: "Everything you need to automate a busy reception desk.",
            price: "£99",
            features: ["Everything in Starter", "Unlimited staff accounts", "DVLA Registration lookups", "Stripe Terminal POS integration", "Automated SMS & MOT Reminders", "Public Online Booking Portal"],
            cta: "Start 14-Day Free Trial",
            highlighted: true,
        },
        {
            name: "Multi-Site",
            desc: "For expanding businesses managing multiple locations.",
            price: "£149",
            features: ["Everything in Pro", "Multi-location fleet management", "Aggregated reporting dashboards", "Priority telephone support", "Custom API access"],
            cta: "Contact Sales",
            highlighted: false,
        },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            <PublicNavbar />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-slate-900 py-24 text-white text-center px-4 border-b border-slate-800">
                    <div className="container mx-auto max-w-4xl">
                        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">Simple, Transparent Pricing</h1>
                        <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                            Upgrade your workshop for less than the cost of a daily cup of coffee. Try any plan free for 14 days.
                        </p>
                    </div>
                </section>

                {/* Pricing Cards */}
                <section className="py-20 -mt-8">
                    <div className="container mx-auto px-4 max-w-6xl">
                        <div className="grid md:grid-cols-3 gap-8 relative z-10">
                            {plans.map((plan) => (
                                <div
                                    key={plan.name}
                                    className={`rounded-2xl p-8 flex flex-col relative overflow-hidden ${plan.highlighted
                                        ? 'bg-primary text-white shadow-xl border-2 border-primary/80 md:-translate-y-4'
                                        : 'bg-white border border-slate-200 shadow-sm'
                                        }`}
                                >
                                    {plan.highlighted && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2">
                                            <span className="bg-white text-primary text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-b-xl">Most Popular</span>
                                        </div>
                                    )}
                                    <h3 className={`text-xl font-bold mb-2 ${plan.highlighted ? 'text-white mt-2' : 'text-slate-900'}`}>{plan.name}</h3>
                                    <p className={`text-sm mb-6 leading-relaxed ${plan.highlighted ? 'text-blue-100' : 'text-slate-500'}`}>{plan.desc}</p>
                                    <div className="mb-6">
                                        <span className={`text-4xl font-black ${plan.highlighted ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                                        <span className={`text-sm font-medium ml-1 ${plan.highlighted ? 'text-blue-200' : 'text-slate-400'}`}>/mo</span>
                                    </div>
                                    <ul className="space-y-3 mb-8 flex-1">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className={`flex items-start gap-3 text-sm leading-relaxed ${plan.highlighted ? 'text-blue-50' : 'text-slate-700'}`}>
                                                <Check className={`h-5 w-5 shrink-0 mt-0.5 ${plan.highlighted ? 'text-blue-300' : 'text-primary'}`} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <Link href="/signup">
                                        <button className={`w-full h-12 rounded-xl font-bold text-sm transition-all ${plan.highlighted
                                            ? 'bg-white text-primary hover:bg-slate-50 shadow-sm'
                                            : 'bg-white border border-slate-200 text-primary hover:bg-primary/5'
                                            }`}>
                                            {plan.cta}
                                        </button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQs */}
                <section className="py-24 bg-white border-t border-slate-100">
                    <div className="container mx-auto max-w-3xl px-4">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">Frequently Asked Questions</h2>
                            <p className="mt-4 text-slate-600 text-base leading-relaxed">Got a question? We&apos;ve got answers. Contact support if you need more help.</p>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                                    <button
                                        className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
                                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                                    >
                                        <span className="font-bold text-slate-900 text-sm">{faq.q}</span>
                                        {openFaq === index
                                            ? <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
                                            : <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
                                        }
                                    </button>
                                    {openFaq === index && (
                                        <div className="p-5 bg-white border-t border-slate-100 text-slate-600 text-sm leading-relaxed">
                                            {faq.a}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

export default function PricingPage() {
    return (
            <PricingContent />
    );
}
