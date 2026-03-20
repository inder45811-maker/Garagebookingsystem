"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { CreditCard, Plus, Trash2, CheckCircle2 } from "lucide-react";

function SettingsContent() {
  const [isCalendarConnected, setIsCalendarConnected] = useState<boolean | null>(null);
  const [savedBusiness, setSavedBusiness] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState(false);

  // Business Profile
  const [businessName, setBusinessName] = useState("BayFlow Demo Garage");
  const [contactPhone, setContactPhone] = useState("01234 567890");
  const [address, setAddress] = useState("123 Workshop Lane, Ind Estate, UK");
  const [reviewLink, setReviewLink] = useState("https://g.page/r/example/review");

  // SMS Templates
  const [templateComplete, setTemplateComplete] = useState(
    "Hi {name}, your vehicle {reg} is ready for collection at {business_name}. Total: \u00a3{total}."
  );
  const [templateStarted, setTemplateStarted] = useState(
    "Hi {name}, we've started work on your vehicle {reg}. We'll update you soon."
  );

  // Terminal Reader States
  const [readers, setReaders] = useState<{ readerId: string; label: string }[]>([
    { readerId: "tmr_mock_123", label: "Front Desk Reader" },
  ]);
  const [newReaderCode, setNewReaderCode] = useState("");
  const [newReaderLabel, setNewReaderLabel] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetch("/api/calendar/status")
      .then((res) => res.json())
      .then((data) => setIsCalendarConnected(data.connected))
      .catch(() => setIsCalendarConnected(false));
  }, []);

  const handleConnectCalendar = () => {
    window.location.href = "/api/calendar/auth";
  };

  const handleDisconnectCalendar = async () => {
    await fetch("/api/calendar/disconnect", { method: "POST" });
    setIsCalendarConnected(false);
  };

  const handleSaveBusiness = () => {
    setSavedBusiness(true);
    setTimeout(() => setSavedBusiness(false), 2500);
  };

  const handleSaveTemplates = () => {
    setSavedTemplates(true);
    setTimeout(() => setSavedTemplates(false), 2500);
  };

  const handleRegisterReader = async () => {
    if (!newReaderCode || !newReaderLabel) return;
    setIsRegistering(true);
    setTimeout(() => {
      setReaders([
        ...readers,
        { readerId: `tmr_${crypto.randomUUID().split("-")[0]}`, label: newReaderLabel },
      ]);
      setNewReaderCode("");
      setNewReaderLabel("");
      setIsRegistering(false);
    }, 1000);
  };

  const handleRemoveReader = (id: string) => {
    setReaders(readers.filter((r) => r.readerId !== id));
  };

  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all";
  const labelClass = "text-xs font-bold text-slate-500 uppercase tracking-wider";

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AppLayout>
        <div className="max-w-3xl mx-auto w-full pb-12 font-sans">
          {/* Page Header */}
          <div className="flex flex-col gap-1 mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-base text-slate-500 font-normal">Manage your business details and preferences.</p>
          </div>

          <div className="space-y-8">
            {/* Business Profile */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Business Profile</h2>
                <p className="text-sm text-slate-500 mt-0.5">This information will appear on invoices and messages.</p>
              </div>
              <div className="px-8 py-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Business Name</label>
                    <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Contact Phone</label>
                    <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={inputClass} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Address</label>
                  <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all resize-none" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Google Maps Review Link</label>
                  <input value={reviewLink} onChange={(e) => setReviewLink(e.target.value)} placeholder="eg. https://g.page/r/your-code/review" className={inputClass} />
                  <p className="text-[10px] text-slate-400 font-medium mt-1">We&apos;ll text this to customers 2 hours after they pay their bill.</p>
                </div>
                <button onClick={handleSaveBusiness} className="flex items-center gap-2 bg-primary text-white px-6 h-10 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">
                  {savedBusiness ? <><CheckCircle2 className="h-4 w-4" /> Saved!</> : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Opening Hours</h2>
                <p className="text-sm text-slate-500 mt-0.5">Set your standard operating hours.</p>
              </div>
              <div className="px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className={labelClass}>Weekdays</label>
                    <input defaultValue="08:00 - 17:30" className={inputClass} />
                  </div>
                  <div className="space-y-2">
                    <label className={labelClass}>Saturday</label>
                    <input defaultValue="09:00 - 13:00" className={inputClass} />
                  </div>
                </div>
              </div>
            </div>

            {/* SMS Templates */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">SMS Templates</h2>
                <p className="text-sm text-slate-500 mt-0.5">Customize the messages sent to customers.</p>
              </div>
              <div className="px-8 py-8 space-y-6">
                <div className="space-y-2">
                  <label className={labelClass}>Job Complete</label>
                  <textarea value={templateComplete} onChange={(e) => setTemplateComplete(e.target.value)} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all resize-none" />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Job Started</label>
                  <textarea value={templateStarted} onChange={(e) => setTemplateStarted(e.target.value)} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all resize-none" />
                </div>
                <button onClick={handleSaveTemplates} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-6 h-10 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                  {savedTemplates ? <><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Saved!</> : "Update Templates"}
                </button>
              </div>
            </div>

            {/* Integrations */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Integrations</h2>
                <p className="text-sm text-slate-500 mt-0.5">Connect BayFlow with your external tools.</p>
              </div>
              <div className="px-8 py-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Google Calendar</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Automatically sync scheduled jobs to your calendar.</p>
                  </div>
                  <div>
                    {isCalendarConnected === null ? (
                      <button disabled className="px-4 h-10 rounded-xl border border-slate-200 text-sm font-bold text-slate-400">Loading...</button>
                    ) : isCalendarConnected ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">Connected</span>
                        <button onClick={handleDisconnectCalendar} className="px-4 h-10 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors">Disconnect</button>
                      </div>
                    ) : (
                      <button onClick={handleConnectCalendar} className="px-4 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20">Connect Google Calendar</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal Readers */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-slate-900">Terminal Readers</h2>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">Register and manage physical Stripe card machines.</p>
              </div>
              <div className="px-8 py-8 space-y-8">
                {/* Register New Reader */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-700 mb-4">Register New Reader</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registration Code</label>
                      <input
                        placeholder="e.g. simulated-wpe"
                        value={newReaderCode}
                        onChange={(e) => setNewReaderCode(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reader Label</label>
                      <input
                        placeholder="e.g. Front Desk"
                        value={newReaderLabel}
                        onChange={(e) => setNewReaderLabel(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <button
                      onClick={handleRegisterReader}
                      disabled={isRegistering || !newReaderCode || !newReaderLabel}
                      className="flex items-center justify-center gap-1 h-[42px] rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isRegistering ? "Registering..." : (
                        <><Plus className="h-4 w-4" /> Add Reader</>
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-3">
                    Enter the pairing code displayed on the physical terminal screen. (Use <code className="bg-slate-200 px-1 py-0.5 rounded text-[10px]">simulated-wpe</code> for testing).
                  </p>
                </div>

                {/* Active Readers */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-3">Active Readers</h4>
                  {readers.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No readers registered yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {readers.map((reader) => (
                        <div key={reader.readerId} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                          <div>
                            <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                              {reader.label}
                              {reader.readerId.includes('mock_123') && (
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">Default</span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-400 tracking-widest font-medium">{reader.readerId}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveReader(reader.readerId)}
                            className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function SettingsPage() {
  return (
    <AuthProvider>
      <SettingsContent />
    </AuthProvider>
  );
}
