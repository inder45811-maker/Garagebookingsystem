"use client";

import { PublicNavbar } from "@/components/marketing/PublicNavbar";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { Wrench } from "lucide-react";

function AboutContent() {
    return (
        <div className="flex flex-col min-h-screen bg-white font-sans">
            <PublicNavbar />

            <main className="flex-1">
                {/* Header */}
                <section className="bg-slate-50 py-24 px-4 border-b border-slate-100">
                    <div className="container mx-auto max-w-3xl text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-8">
                            <Wrench className="h-7 w-7" />
                        </div>
                        <h1 className="text-3xl md:text-5xl leading-[1.1] font-extrabold tracking-tight text-slate-900 mb-6">Built for the mechanics, not the dealerships.</h1>
                        <p className="text-lg leading-relaxed text-slate-600">
                            We started BayFlow because we were tired of seeing independent garages forced to use bloated software designed for multi-million pound showrooms.
                        </p>
                    </div>
                </section>

                {/* Narrative Content */}
                <section className="py-24 px-4">
                    <div className="container mx-auto max-w-3xl">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">The Whiteboard Era is Over</h2>
                        <p className="text-base leading-relaxed text-slate-600 mb-6">
                            Walk into almost any independent specialist or MOT testing center in the UK, and you will find the exact same thing behind the reception desk: A messy, smudged whiteboard.
                        </p>
                        <p className="text-base leading-relaxed text-slate-600 mb-6">
                            Keys get misplaced, invoices get printed and shoved into plastic sleeves, and service reminders are completely forgotten. The existing software solutions cost hundreds of pounds a month and require a dedicated IT person just to set up.
                        </p>

                        <hr className="my-12 border-slate-200" />

                        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">Our Mission</h2>
                        <p className="text-base leading-relaxed text-slate-600 mb-6">
                            BayFlow was built by a small team who spent too many weekends helping their local mechanics untangle paper diaries. Our goal was simple: Build a system that actually makes sense on a busy workshop floor.
                        </p>
                        <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-xl my-8">
                            <p className="text-primary font-bold italic m-0 text-base leading-relaxed">
                                &quot;We don&apos;t need a CRM that tracks leads. We need a way to know exactly which ramp the blue Fiesta is on, and if it&apos;s been paid for.&quot;
                            </p>
                        </div>
                        <p className="text-base leading-relaxed text-slate-600 mb-6">
                            We stripped out the noise. We integrated direct DVLA lookups so you never have to type a VIN manually again. We partnered with Stripe so you can push payments directly to a card machine without keying in ££ amounts.
                        </p>
                        <p className="text-base leading-relaxed text-slate-600 mb-6">
                            We built BayFlow so you can get out from behind the reception desk, and back into the workshop.
                        </p>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

export default function AboutPage() {
    return (
            <AboutContent />
    );
}
