"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Wrench, Search, CheckCircle2 } from "lucide-react";

export default function PublicBookingPage() {
    const params = useParams();
    const garageId = params.garageId as string;

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [garageName, setGarageName] = useState("Local Garage");

    const [formData, setFormData] = useState({
        customerName: "",
        phone: "",
        registration: "",
        make: "",
        model: "",
        jobType: "Service",
        description: "",
        date: "",
        time: "09:00",
    });

    useEffect(() => {
        setGarageName("BayFlow Demo Garage");
    }, [garageId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLookupReg = async () => {
        if (!formData.registration) return;
        setLoading(true);
        try {
            const res = await fetch("/api/vehicle-lookup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ registration: formData.registration }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setFormData(prev => ({
                ...prev,
                make: data.make || prev.make,
                model: data.model || prev.model,
            }));
        } catch (err) {
            console.error("Lookup failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customerName: formData.customerName,
                    phone: formData.phone,
                    registration: formData.registration,
                    make: formData.make,
                    model: formData.model,
                    jobType: formData.jobType,
                    description: formData.description,
                    date: formData.date,
                    time: formData.time,
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error ?? "Booking failed");
            }
            setSubmitted(true);
        } catch (error: unknown) {
            console.error("Failed to submit booking", error);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all";
    const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";
    const selectClass = "w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 bg-white transition-all appearance-none cursor-pointer";

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] p-10 text-center space-y-6">
                    <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto">
                        <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Booking Requested!</h2>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Thanks {formData.customerName.split(' ')[0]}. Your booking request for the {formData.make} has been sent to {garageName}.
                            They will be in touch shortly to confirm.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12 font-sans">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-primary to-blue-700 text-white w-full py-12 px-4 shadow-lg">
                <div className="max-w-3xl mx-auto space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <Wrench className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">{garageName}</h1>
                            <p className="text-blue-100 mt-0.5 text-sm">Book your vehicle in online</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto mt-8 px-4">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer Info */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Your Details</h2>
                            <p className="text-sm text-slate-500 mt-0.5">We need this to contact you regarding your booking.</p>
                        </div>
                        <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className={labelClass}>Full Name</label>
                                <input name="customerName" required placeholder="John Smith" onChange={handleChange} className={inputClass} />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClass}>Phone Number</label>
                                <input name="phone" required placeholder="07700 900123" onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Details */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Vehicle Details</h2>
                            <p className="text-sm text-slate-500 mt-0.5">Enter your registration plate to automatically fetch the details.</p>
                        </div>
                        <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-5 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <label className={labelClass}>Registration</label>
                                <div className="flex gap-2">
                                    <input
                                        name="registration"
                                        required
                                        placeholder="AB12 CDE"
                                        className="flex-1 px-4 py-3 border-2 border-yellow-400 rounded-xl text-sm font-black uppercase bg-yellow-50 text-slate-900 placeholder-yellow-600/40 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                                        onChange={handleChange}
                                        value={formData.registration}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleLookupReg}
                                        disabled={loading || !formData.registration}
                                        className="flex items-center justify-center w-12 h-[46px] bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20"
                                    >
                                        <Search className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className={labelClass}>Make</label>
                                        <input name="make" required placeholder="Ford" onChange={handleChange} value={formData.make} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className={labelClass}>Model</label>
                                        <input name="model" required placeholder="Focus" onChange={handleChange} value={formData.model} className={inputClass} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service & Scheduling */}
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900">Service Required</h2>
                        </div>
                        <div className="px-8 py-8 space-y-6">
                            <div className="space-y-2">
                                <label className={labelClass}>What do you need?</label>
                                <select name="jobType" onChange={handleChange} value={formData.jobType} className={selectClass}>
                                    <option value="Service">General Service</option>
                                    <option value="MOT">MOT Test</option>
                                    <option value="Repair">Specific Repair</option>
                                    <option value="Diagnostic">Diagnostic Check</option>
                                    <option value="Tyres">Tyre Replacement</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                                <div className="space-y-2">
                                    <label className={labelClass}>Preferred Date</label>
                                    <input type="date" name="date" required onChange={handleChange} className={inputClass} />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass}>Preferred Time</label>
                                    <select name="time" onChange={handleChange} value={formData.time} className={selectClass}>
                                        <option value="09:00">09:00 - Morning</option>
                                        <option value="13:00">13:00 - Afternoon</option>
                                        <option value="16:00">16:00 - Late Afternoon</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 pt-6 border-t border-slate-100">
                                <label className={labelClass}>Any specific issues or requests?</label>
                                <textarea name="description" placeholder="E.g. I hear a squeaking noise when braking..." onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all resize-none" />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-full bg-primary text-white font-bold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : (
                            "Request Booking"
                        )}
                    </button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        By requesting this booking, you agree to the garage&apos;s terms and conditions. {garageName} will contact you to confirm the time slot.
                    </p>
                </form>
            </div>
        </div>
    );
}
