"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { User as UserIcon, Plus } from "lucide-react";
import { User } from "@/types";

function TeamContent() {
    const { registerMechanic } = useAuth();
    const [mechanics, setMechanics] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });

    useEffect(() => {
        setMechanics([
            { id: "m1", name: "David Tech", email: "david@bayflow.app", role: "mechanic", garageId: "garage_001" }
        ]);
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        setLoading(true);
        try {
            const newMech = await registerMechanic(formData.name, formData.email, formData.password);
            setMechanics([...mechanics, newMech]);
            setFormData({ name: "", email: "", password: "" });
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError(errorMessage ?? "Failed to create account.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";

    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <AppLayout>
                <div className="max-w-[1200px] mx-auto w-full pb-12 font-sans">
                    {/* Page Header */}
                    <div className="flex flex-col gap-1 mb-8">
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Staff Management</h1>
                        <p className="text-base text-slate-500 font-normal">Manage roles, mechanics, and system access.</p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2">
                        {/* Invite Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">Invite Mechanic</h2>
                                <p className="text-sm text-slate-500 mt-0.5">Grant access to a new employee. They will receive an email with their default password.</p>
                            </div>
                            <div className="px-8 py-8">
                                <form onSubmit={handleRegister} className="space-y-5">
                                    {error && (
                                        <p className="text-sm text-rose-600 bg-rose-50 border border-rose-100 rounded-xl p-3 font-medium">{error}</p>
                                    )}
                                    <div className="space-two">
                                        <label className={labelClass}>Full Name</label>
                                        <input
                                            className={inputClass}
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="John Smith"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Email Address</label>
                                        <input
                                            type="email"
                                            className={inputClass}
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Temporary Password</label>
                                        <input
                                            type="password"
                                            className={inputClass}
                                            required
                                            minLength={8}
                                            value={formData.password}
                                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Min. 8 characters"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-11 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        ) : (
                                            <><Plus className="h-4 w-4" /> Create Account</>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Staff List */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                            <div className="px-8 py-6 border-b border-slate-100">
                                <h2 className="text-lg font-bold text-slate-900">Active Staff Members</h2>
                                <p className="text-sm text-slate-500 mt-0.5">The following accounts currently have access to this garage.</p>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {/* Admin */}
                                <div className="flex items-center justify-between px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                            <UserIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">Alex Admin</p>
                                            <p className="text-xs text-slate-500">admin@bayflow.app</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-black uppercase tracking-widest">Admin</span>
                                </div>

                                {mechanics.map((mech) => (
                                    <div key={mech.id} className="flex items-center justify-between px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <UserIcon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{mech.name}</p>
                                                <p className="text-xs text-slate-500">{mech.email}</p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] px-3 py-1 bg-primary/10 text-primary rounded-full font-black uppercase tracking-widest capitalize">{mech.role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </AppLayout>
        </ProtectedRoute>
    );
}

export default function TeamPage() {
    return (
        <AuthProvider>
            <TeamContent />
        </AuthProvider>
    );
}
