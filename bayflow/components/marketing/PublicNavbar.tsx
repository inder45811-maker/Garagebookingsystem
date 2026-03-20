"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export function PublicNavbar() {
    const { user, isLoading } = useAuth();

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 font-sans">
            <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-sm font-black text-white">B</span>
                    </div>
                    <span className="text-xl font-extrabold tracking-tight text-slate-900">BayFlow</span>
                </Link>

                {/* Desktop Links */}
                <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
                    <Link href="/features" className="hover:text-primary transition-colors">Features</Link>
                    <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
                    <Link href="/about" className="hover:text-primary transition-colors">About</Link>
                </nav>

                {/* Auth / CTA */}
                <div className="flex items-center gap-4">
                    {!isLoading && (
                        <>
                            {user ? (
                                <Link href="/dashboard">
                                    <button className="hidden sm:inline-flex items-center gap-2 px-5 h-10 rounded-xl border border-primary/20 text-primary text-sm font-bold hover:bg-primary/5 transition-colors">
                                        Go to Dashboard
                                    </button>
                                </Link>
                            ) : (
                                <>
                                    <Link href="/login" className="text-sm font-bold text-slate-500 hover:text-primary hidden sm:block transition-colors">
                                        Log In
                                    </Link>
                                    <Link href="/signup">
                                        <button className="px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
                                            Start Free Trial
                                        </button>
                                    </Link>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
