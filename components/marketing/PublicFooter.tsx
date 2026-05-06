import Link from "next/link";

export function PublicFooter() {
    return (
        <footer className="bg-slate-50 border-t border-slate-100 py-16 text-sm text-slate-500 font-sans">
            <div className="container mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-4 gap-10">

                {/* Brand */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-xs font-black text-white">B</span>
                        </div>
                        <span className="text-lg font-extrabold tracking-tight text-slate-900">BayFlow</span>
                    </div>
                    <p className="max-w-xs text-slate-500 text-sm leading-relaxed">
                        Turn garage chaos into clockwork. The all-in-one queue, booking, and payment system for independent specialists.
                    </p>
                </div>

                {/* Product */}
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 tracking-widest uppercase text-[10px]">Product</h3>
                    <ul className="space-y-2.5">
                        <li><Link href="/features" className="hover:text-primary transition-colors">Features</Link></li>
                        <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                        <li><Link href="/features#card-machines" className="hover:text-primary transition-colors">Stripe Terminal</Link></li>
                    </ul>
                </div>

                {/* Company */}
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 tracking-widest uppercase text-[10px]">Company</h3>
                    <ul className="space-y-2.5">
                        <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                        <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h3 className="font-bold text-slate-900 mb-4 tracking-widest uppercase text-[10px]">Contact</h3>
                    <ul className="space-y-2.5">
                        <li><a href="mailto:support@bayflow.app" className="hover:text-primary transition-colors">support@bayflow.app</a></li>
                        <li><p>Registered in England & Wales</p></li>
                    </ul>
                </div>

            </div>

            <div className="container mx-auto max-w-7xl px-4 mt-12 pt-8 border-t border-slate-200">
                <p className="text-center text-xs text-slate-400">© {new Date().getFullYear()} BayFlow App. All rights reserved.</p>
            </div>
        </footer>
    );
}
