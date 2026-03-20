"use client";

import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { store } from "@/lib/store";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

// Mechanic list — matches the team page seed data
const MECHANICS = [
  { id: "m1", name: "David Tech" },
];

function NewJobContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    registration: "",
    make: "",
    model: "",
    color: "",
    year: "",
    mileage: "",
    fuelType: "",
    engineCapacity: "",
    motStatus: "",
    taxStatus: "",
    co2Emissions: "",
    monthOfFirstRegistration: "",
    assignedMechanic: "",
    jobType: "Service",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
  });

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
        color: data.color || prev.color,
        year: data.year || prev.year,
        fuelType: data.fuelType || prev.fuelType,
        engineCapacity: data.engineCapacity ? String(data.engineCapacity) : prev.engineCapacity,
        motStatus: data.motStatus || prev.motStatus,
        taxStatus: data.taxStatus || prev.taxStatus,
        co2Emissions: data.co2Emissions ? String(data.co2Emissions) : prev.co2Emissions,
        monthOfFirstRegistration: data.monthOfFirstRegistration || prev.monthOfFirstRegistration,
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
      const customer = await store.addCustomer({
        name: formData.customerName,
        phone: formData.phone,
        vehicleIds: [],
      });

      await store.addJob({
        customerId: customer.id,
        vehicle: {
          registration: formData.registration.toUpperCase(),
          make: formData.make,
          model: formData.model,
          year: formData.year,
          color: formData.color
        },
        type: formData.jobType,
        status: "waiting",
        description: formData.description,
        queuePosition: 999,
        assignedMechanicId: formData.assignedMechanic || undefined,
        assignedMechanicName: formData.assignedMechanic ? MECHANICS.find(m => m.id === formData.assignedMechanic)?.name : undefined,
        startTime: formData.date && formData.startTime ? `${formData.date}T${formData.startTime}:00` : undefined,
        endTime: formData.date && formData.endTime ? `${formData.date}T${formData.endTime}:00` : undefined,
      });

      router.push("/queue");
    } catch (error) {
      console.error("Failed to create job", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all";
  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";
  const selectClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 bg-white transition-all appearance-none cursor-pointer";

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto pb-12 font-sans">
        {/* Page Header */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Check-in Vehicle</h1>
          <p className="text-base text-slate-500 font-normal">Add a new job to the queue.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer & Vehicle Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Customer & Vehicle Details</h2>
              <p className="text-sm text-slate-500 font-normal mt-0.5">Enter the customer and vehicle information below.</p>
            </div>
            <div className="px-8 py-8 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>Customer Name</label>
                  <input name="customerName" required placeholder="Jane Doe" onChange={handleChange} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Phone Number</label>
                  <input name="phone" required placeholder="07700 900000" onChange={handleChange} className={inputClass} />
                </div>
              </div>

              {/* Vehicle Info */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className={labelClass}>Registration</label>
                  <div className="flex gap-2">
                    <input
                      name="registration"
                      required
                      placeholder="AB12 CDE"
                      className="flex-1 px-4 py-2.5 border-2 border-yellow-400 rounded-xl text-sm font-black uppercase bg-yellow-50 text-slate-900 placeholder-yellow-600/40 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
                      onChange={handleChange}
                      value={formData.registration}
                    />
                    <button
                      type="button"
                      onClick={handleLookupReg}
                      disabled={loading || !formData.registration}
                      className="flex items-center justify-center w-12 h-[42px] bg-primary text-white rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Make</label>
                  <input name="make" required placeholder="Ford" onChange={handleChange} value={formData.make} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Model</label>
                  <input name="model" required placeholder="Focus" onChange={handleChange} value={formData.model} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Color</label>
                  <input name="color" placeholder="Blue" onChange={handleChange} value={formData.color} className={inputClass} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Mileage</label>
                <input name="mileage" type="number" placeholder="45000" onChange={handleChange} value={formData.mileage} className={`${inputClass} max-w-[200px]`} />
              </div>

              {/* DVLA Vehicle Info — auto-populated from lookup */}
              {(formData.fuelType || formData.engineCapacity || formData.motStatus || formData.taxStatus || formData.co2Emissions || formData.monthOfFirstRegistration) && (
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">DVLA Vehicle Info</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-xl">
                    {formData.fuelType && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fuel Type</label>
                        <p className="text-sm font-bold text-slate-900">{formData.fuelType}</p>
                      </div>
                    )}
                    {formData.engineCapacity && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Engine (cc)</label>
                        <p className="text-sm font-bold text-slate-900">{formData.engineCapacity}</p>
                      </div>
                    )}
                    {formData.co2Emissions && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CO₂ (g/km)</label>
                        <p className="text-sm font-bold text-slate-900">{formData.co2Emissions}</p>
                      </div>
                    )}
                    {formData.motStatus && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">MOT Status</label>
                        <p className={`text-sm font-bold ${formData.motStatus === "Valid" ? "text-emerald-600" : "text-rose-600"}`}>{formData.motStatus}</p>
                      </div>
                    )}
                    {formData.taxStatus && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tax Status</label>
                        <p className={`text-sm font-bold ${formData.taxStatus === "Taxed" ? "text-emerald-600" : "text-rose-600"}`}>{formData.taxStatus}</p>
                      </div>
                    )}
                    {formData.monthOfFirstRegistration && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">First Registered</label>
                        <p className="text-sm font-bold text-slate-900">{formData.monthOfFirstRegistration}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Details Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Job Details</h2>
            </div>
            <div className="px-8 py-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>Job Type</label>
                  <select name="jobType" onChange={handleChange} value={formData.jobType} className={selectClass}>
                    <option value="Service">Service</option>
                    <option value="MOT">MOT</option>
                    <option value="Repair">Repair</option>
                    <option value="Diagnostic">Diagnostic</option>
                    <option value="Tyres">Tyres</option>
                    <option value="Detailing">Detailing</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Assign Mechanic</label>
                  <select name="assignedMechanic" onChange={handleChange} value={formData.assignedMechanic} className={selectClass}>
                    <option value="">Unassigned</option>
                    {MECHANICS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelClass}>Notes / Description</label>
                <textarea
                  name="description"
                  placeholder="Customer states noise coming from front left..."
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Scheduling Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Scheduling</h2>
              <p className="text-sm text-slate-500 font-normal mt-0.5">Setting a time will sync this job to Google Calendar if connected.</p>
            </div>
            <div className="px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>Date</label>
                  <input type="date" name="date" onChange={handleChange} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Start Time</label>
                  <input type="time" name="startTime" onChange={handleChange} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>End Time</label>
                  <input type="time" name="endTime" onChange={handleChange} className={inputClass} />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-primary text-white px-8 h-12 rounded-full font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
              )}
              <span>Add to Queue</span>
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default function NewJobPage() {
  return (
    <AuthProvider>
      <NewJobContent />
    </AuthProvider>
  );
}
