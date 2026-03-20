
"use client";

import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { store } from "@/lib/store";
import { useRouter, useParams } from "next/navigation";
import { Job, JobStatus, Customer, CommunicationLog, InvoiceLineItem, Invoice } from "@/types";
import {
  ArrowLeft, Car, User, FileText, Banknote, Image as ImageIcon, CreditCard,
  Plus, MessageSquare, Phone, Mail, Users, Activity, Receipt, Printer, Trash2
} from "lucide-react";
import { loadStripeTerminal } from '@stripe/terminal-js';

function JobDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAuth();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customer, setCustomer] = useState<Customer | null>(null);

  // Terminal States
  const [terminalStatus, setTerminalStatus] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Authorized Contacts
  const [showContactForm, setShowContactForm] = useState(false);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRelation, setNewContactRelation] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  // Communication Log
  const [logMessage, setLogMessage] = useState("");
  const [logType, setLogType] = useState<CommunicationLog['type']>('phone');

  // Invoice
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceSaved, setInvoiceSaved] = useState(false);
  const [savingInvoice, setSavingInvoice] = useState(false);
  const vatRate = 20;

  // Derived totals
  const subtotal = lineItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const vatAmount = subtotal * (vatRate / 100);
  const invoiceTotal = subtotal + vatAmount;

  useEffect(() => {
    async function fetchJob() {
      const allJobs = await store.getJobs();
      const foundJob = allJobs.find((j) => j.id === id);
      if (foundJob) {
        setJob(foundJob);
        const customers = await store.getCustomers();
        const foundCustomer = customers.find(c => c.id === foundJob.customerId);
        setCustomer(foundCustomer || null);
        if (foundJob.invoice) {
          setLineItems(foundJob.invoice.lineItems);
          setInvoiceNotes(foundJob.invoice.notes || "");
          setInvoiceSaved(true);
        }
      }
      setLoading(false);
    }
    fetchJob();
  }, [id]);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!job) return;
    const newStatus = e.target.value as JobStatus;
    setJob({ ...job, status: newStatus });
    await store.updateJob(job.id, { status: newStatus });
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!job) return;
    setJob({ ...job, internalNotes: e.target.value });
  };

  const handleSaveNotes = async () => {
    if (!job) return;
    setSaving(true);
    await store.updateJob(job.id, { internalNotes: job.internalNotes });
    setSaving(false);
  };

  const handleAddContact = async () => {
    if (!job || !newContactName || !newContactRelation || !newContactPhone) return;
    const newContact = { name: newContactName, relation: newContactRelation, phone: newContactPhone };
    const updatedContacts = [...(job.authorizedContacts || []), newContact];
    setJob({ ...job, authorizedContacts: updatedContacts });
    await store.updateJob(job.id, { authorizedContacts: updatedContacts });
    setNewContactName("");
    setNewContactRelation("");
    setNewContactPhone("");
    setShowContactForm(false);
  };

  const handleLogCommunication = async () => {
    if (!job || !logMessage.trim()) return;
    const newLog: CommunicationLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      type: logType,
      message: logMessage.trim(),
      loggedBy: user?.name ?? 'Staff',
    };
    const updatedLogs = [...(job.communications || []), newLog];
    setJob({ ...job, communications: updatedLogs });
    await store.updateJob(job.id, { communications: updatedLogs });
    setLogMessage("");
  };

  // --- Invoice handlers ---

  const handleAddLineItem = () => {
    setLineItems(prev => [...prev, { id: crypto.randomUUID(), description: "", qty: 1, unitPrice: 0 }]);
    setInvoiceSaved(false);
  };

  const handleAddPreset = (type: 'labour' | 'mot' | 'service' | 'part') => {
    const presets: Record<string, { description: string; qty: number; unitPrice: number }> = {
      labour: { description: "Labour", qty: 1, unitPrice: 75.00 },
      mot:    { description: "MOT Test", qty: 1, unitPrice: 55.00 },
      service: { description: "Full Service", qty: 1, unitPrice: 129.00 },
      part:   { description: "Parts", qty: 1, unitPrice: 0.00 },
    };
    setLineItems(prev => [...prev, { id: crypto.randomUUID(), ...presets[type] }]);
    setInvoiceSaved(false);
  };

  const handleUpdateLineItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    setInvoiceSaved(false);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems(prev => prev.filter(item => item.id !== id));
    setInvoiceSaved(false);
  };

  const handleSaveInvoice = async () => {
    if (!job || lineItems.length === 0) return;
    setSavingInvoice(true);
    const invoice: Invoice = {
      lineItems,
      vatRate,
      notes: invoiceNotes,
      createdAt: job.invoice?.createdAt || new Date().toISOString(),
      status: job.paymentStatus === 'paid' ? 'paid' : 'draft',
    };
    await store.updateJob(job.id, { invoice, quoteAmount: invoiceTotal });
    setJob({ ...job, invoice, quoteAmount: invoiceTotal });
    setInvoiceSaved(true);
    setSavingInvoice(false);
  };

  const handleMarkPaidCash = async () => {
    if (!job) return;
    if (!invoiceSaved) {
      await handleSaveInvoice();
    }
    const updatedInvoice: Invoice = {
      lineItems,
      vatRate,
      notes: invoiceNotes,
      createdAt: job.invoice?.createdAt || new Date().toISOString(),
      status: 'paid',
      paymentMethod: 'cash',
      paidAt: new Date().toISOString(),
    };
    await store.updateJob(job.id, { paymentStatus: 'paid', status: 'collected', invoice: updatedInvoice, quoteAmount: invoiceTotal });
    setJob({ ...job, paymentStatus: 'paid', status: 'collected', invoice: updatedInvoice, quoteAmount: invoiceTotal });
    setInvoiceSaved(true);
  };

  const handlePrintInvoice = () => {
    if (!job || !customer) return;
    const sub = lineItems.reduce((s, i) => s + i.qty * i.unitPrice, 0);
    const vat = sub * (vatRate / 100);
    const tot = sub + vat;
    const invNum = `INV-${job.id.slice(0, 8).toUpperCase()}`;
    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
    const rows = lineItems.map(i => `
      <tr>
        <td>${i.description || '—'}</td>
        <td class="center">${i.qty}</td>
        <td class="right">£${i.unitPrice.toFixed(2)}</td>
        <td class="right">£${(i.qty * i.unitPrice).toFixed(2)}</td>
      </tr>`).join('');

    const paidStamp = job.paymentStatus === 'paid'
      ? `<div style="text-align:center;margin-bottom:32px"><span style="display:inline-block;border:4px solid #059669;color:#059669;font-size:28px;font-weight:900;padding:6px 20px;border-radius:8px;transform:rotate(-10deg);letter-spacing:4px;opacity:0.7">PAID</span></div>`
      : '';

    const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>Invoice ${invNum}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f172a;background:#fff;padding:48px;font-size:14px;line-height:1.5}
  .top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px;padding-bottom:32px;border-bottom:2px solid #e2e8f0}
  .garage-name{font-size:18px;font-weight:900;margin-bottom:4px}
  .garage-info{font-size:12px;color:#64748b;line-height:1.8}
  .inv-label{text-align:right}
  .inv-label .word{font-size:36px;font-weight:900;letter-spacing:-2px;line-height:1}
  .inv-label .num{font-size:13px;color:#64748b;margin-top:6px;font-weight:600}
  .inv-label .date{font-size:12px;color:#94a3b8;margin-top:2px}
  .meta{display:grid;grid-template-columns:1fr 1fr 1fr;gap:32px;margin-bottom:40px}
  .meta-group h3{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;margin-bottom:8px}
  .meta-group .name{font-weight:700;font-size:14px;color:#0f172a}
  .meta-group p{font-size:13px;color:#334155;line-height:1.7}
  .reg{display:inline-block;background:#fef3c7;border:1px solid #fcd34d;padding:3px 10px;border-radius:4px;font-weight:900;font-size:14px;letter-spacing:1px;color:#92400e;margin-bottom:4px}
  table{width:100%;border-collapse:collapse;margin-bottom:24px}
  thead{background:#f8fafc}
  th{padding:10px 14px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#94a3b8;border-bottom:1px solid #e2e8f0}
  td{padding:12px 14px;font-size:13px;border-bottom:1px solid #f1f5f9;color:#334155}
  tr:last-child td{border-bottom:none}
  .right{text-align:right}
  .center{text-align:center}
  .totals{margin-left:auto;width:280px;margin-top:8px}
  .t-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#64748b}
  .t-total{display:flex;justify-content:space-between;font-size:17px;font-weight:900;color:#0f172a;padding-top:12px;margin-top:8px;border-top:2px solid #e2e8f0}
  .footer{margin-top:64px;padding-top:24px;border-top:1px solid #e2e8f0;text-align:center;font-size:11px;color:#cbd5e1}
  @media print{body{padding:24px}}
</style>
</head><body>
<div class="top">
  <div>
    <div class="garage-name">BayFlow Demo Garage</div>
    <div class="garage-info">123 Workshop Lane, Ind Estate, UK<br>Tel: 01234 567890<br>VAT No: GB123 456 789</div>
  </div>
  <div class="inv-label">
    <div class="word">INVOICE</div>
    <div class="num">${invNum}</div>
    <div class="date">Issued: ${dateStr}</div>
  </div>
</div>
<div class="meta">
  <div class="meta-group">
    <h3>Bill To</h3>
    <p class="name">${customer.name}</p>
    <p>${customer.phone}</p>
    ${customer.email ? `<p>${customer.email}</p>` : ''}
    ${customer.address ? `<p>${customer.address}</p>` : ''}
  </div>
  <div class="meta-group">
    <h3>Vehicle</h3>
    <p><span class="reg">${job.vehicle.registration}</span></p>
    <p class="name">${job.vehicle.make} ${job.vehicle.model}</p>
    ${job.vehicle.year ? `<p>${job.vehicle.year}</p>` : ''}
  </div>
  <div class="meta-group">
    <h3>Job</h3>
    <p class="name">${job.type}</p>
    <p>${job.description}</p>
  </div>
</div>
${paidStamp}
<table>
  <thead><tr>
    <th>Description</th>
    <th class="center">Qty</th>
    <th class="right">Unit Price</th>
    <th class="right">Total</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="totals">
  <div class="t-row"><span>Subtotal</span><span>£${sub.toFixed(2)}</span></div>
  <div class="t-row"><span>VAT (${vatRate}%)</span><span>£${vat.toFixed(2)}</span></div>
  <div class="t-total"><span>Total Due</span><span>£${tot.toFixed(2)}</span></div>
</div>
${invoiceNotes ? `<p style="margin-top:32px;font-size:12px;color:#64748b"><strong>Notes:</strong> ${invoiceNotes}</p>` : ''}
<div class="footer">Thank you for your business &bull; Powered by BayFlow</div>
</body></html>`;

    const w = window.open('', '_blank', 'width=850,height=1100');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 400);
  };

  // --- Terminal payment ---

  const handleTerminalPayment = async () => {
    if (!job) return;
    setIsProcessingPayment(true);
    setTerminalStatus("Connecting to Stripe Terminal...");

    try {
      const terminal = await loadStripeTerminal();
      if (!terminal) throw new Error("Stripe Terminal SDK failed to load.");

      const stripeTerminal = terminal.create({
        onFetchConnectionToken: async () => {
          const res = await fetch('/api/terminal/connection-token', { method: 'POST' });
          const data = await res.json();
          if (data.error) throw new Error(data.error);
          return data.secret;
        },
        onUnexpectedReaderDisconnect: () => {
          setTerminalStatus("Error: Reader disconnected unexpectedly.");
        }
      });

      setTerminalStatus("Discovering readers...");
      const discoverResult = await stripeTerminal.discoverReaders({ simulated: true }) as { error?: { message: string }, discoveredReaders: Record<string, unknown>[] };
      if (discoverResult.error) throw new Error(discoverResult.error.message);

      const readers = discoverResult.discoveredReaders;
      if (readers.length === 0) throw new Error("No card readers found.");

      setTerminalStatus("Connecting to reader...");
      const connectResult = await stripeTerminal.connectReader(readers[0] as never) as { error?: { message: string } };
      if (connectResult.error) throw new Error(connectResult.error.message);

      setTerminalStatus("Creating payment intent...");

      // Use invoice total if available, otherwise fall back to quoteAmount
      const chargeAmount = invoiceSaved && invoiceTotal > 0 ? invoiceTotal : job.quoteAmount;
      if (!chargeAmount || chargeAmount <= 0) {
        throw new Error("Cannot process payment: no amount set. Please build an invoice first.");
      }

      const intentRes = await fetch('/api/terminal/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: chargeAmount, jobId: job.id, garageId: 'mock-garage-id' })
      });
      const intentData = await intentRes.json();
      if (intentData.error) throw new Error(intentData.error);
      const { clientSecret, intentId } = intentData;

      setTerminalStatus("Please ask customer to tap card on the terminal...");
      const collectResult = await stripeTerminal.collectPaymentMethod(clientSecret) as { error?: { message: string }, paymentIntent: Record<string, unknown> };
      if (collectResult.error) throw new Error(collectResult.error.message);

      setTerminalStatus("Processing payment...");
      const processResult = await stripeTerminal.processPayment(collectResult.paymentIntent as never) as { error?: { message: string } };
      if (processResult.error) throw new Error(processResult.error.message);

      setTerminalStatus("Finalising transaction...");
      const captureRes = await fetch('/api/terminal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentIntentId: intentId, jobId: job.id })
      });
      const captureData = await captureRes.json();
      if (captureData.error) throw new Error(captureData.error);

      // Mark invoice paid by card
      const updatedInvoice: Invoice = {
        lineItems,
        vatRate,
        notes: invoiceNotes,
        createdAt: job.invoice?.createdAt || new Date().toISOString(),
        status: 'paid',
        paymentMethod: 'card',
        paidAt: new Date().toISOString(),
      };

      await store.updateJob(job.id, { paymentStatus: 'paid', status: 'collected', invoice: updatedInvoice });
      setJob({ ...job, paymentStatus: 'paid', status: 'collected', invoice: updatedInvoice });
      setTerminalStatus("Payment Successful!");

      setTimeout(() => {
        setIsProcessingPayment(false);
        setTerminalStatus(null);
      }, 3000);

    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setTerminalStatus(`Payment Failed: ${errorMessage}`);
      setTimeout(() => setIsProcessingPayment(false), 5000);
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'ready':
      case 'collected': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'in_bay': return 'bg-primary/10 text-primary border-primary/20';
      case 'awaiting_approval': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const logIcon = (type: string) => {
    switch (type) {
      case 'sms': return <MessageSquare className="h-3.5 w-3.5 text-primary" />;
      case 'phone': return <Phone className="h-3.5 w-3.5 text-emerald-500" />;
      case 'email': return <Mail className="h-3.5 w-3.5 text-amber-500" />;
      case 'in-person': return <Users className="h-3.5 w-3.5 text-purple-500" />;
      default: return <Activity className="h-3.5 w-3.5 text-slate-500" />;
    }
  };

  const selectClass = "px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 bg-white transition-all appearance-none cursor-pointer";
  const inputClass = "w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all";

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    </AppLayout>
  );

  if (!job) return (
    <AppLayout>
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-slate-500 font-medium">Job not found</p>
        <button onClick={() => router.back()} className="text-primary font-bold text-sm mt-4 hover:underline">Go Back</button>
      </div>
    </AppLayout>
  );

  return (
    <ProtectedRoute allowedRoles={["admin", "mechanic"]}>
      <AppLayout>
        <div className="max-w-[1440px] mx-auto w-full pb-12 font-sans">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{job.vehicle.registration}</h1>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border ${statusColor(job.status)}`}>
                  {job.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-slate-500">{job.vehicle.make} {job.vehicle.model} · {job.type}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Details */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-slate-900">Job Details</h2>
                </div>
                <div className="px-8 py-8 space-y-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                    <p className="text-sm text-slate-900 leading-relaxed">{job.description || "No description provided."}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Internal Notes</label>
                    <textarea
                      placeholder="Mechanic notes, parts required, etc."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all resize-none min-h-[120px]"
                      value={job.internalNotes || ""}
                      onChange={handleNotesChange}
                    />
                    <div className="mt-3 flex justify-end">
                      <button onClick={handleSaveNotes} disabled={saving} className="flex items-center gap-2 px-5 h-9 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50">
                        {saving ? <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div> : null}
                        Save Notes
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Builder */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-slate-900">Invoice</h2>
                  </div>
                  {invoiceSaved && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-1">
                      ✓ Saved
                    </span>
                  )}
                </div>
                <div className="px-8 py-8 space-y-4">
                  {/* Quick-add presets */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-center">Quick add:</span>
                    {(['labour', 'mot', 'service', 'part'] as const).map(preset => (
                      <button
                        key={preset}
                        onClick={() => handleAddPreset(preset)}
                        disabled={job.paymentStatus === 'paid'}
                        className="px-3 h-7 rounded-lg border border-dashed border-slate-300 text-xs font-semibold text-slate-500 hover:border-primary hover:text-primary transition-colors capitalize disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        + {preset === 'labour' ? 'Labour (£75)' : preset === 'mot' ? 'MOT (£55)' : preset === 'service' ? 'Service (£129)' : 'Part'}
                      </button>
                    ))}
                  </div>

                  {/* Line items header */}
                  {lineItems.length > 0 && (
                    <div className="grid grid-cols-[1fr_64px_96px_72px_32px] gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                      <span>Description</span>
                      <span className="text-center">Qty</span>
                      <span className="text-right">Unit Price</span>
                      <span className="text-right">Total</span>
                      <span />
                    </div>
                  )}

                  {/* Line items */}
                  {lineItems.map(item => (
                    <div key={item.id} className="grid grid-cols-[1fr_64px_96px_72px_32px] gap-2 items-center">
                      <input
                        value={item.description}
                        onChange={e => handleUpdateLineItem(item.id, 'description', e.target.value)}
                        placeholder="Description..."
                        disabled={job.paymentStatus === 'paid'}
                        className={inputClass}
                      />
                      <input
                        type="number"
                        value={item.qty}
                        onChange={e => handleUpdateLineItem(item.id, 'qty', parseFloat(e.target.value) || 0)}
                        disabled={job.paymentStatus === 'paid'}
                        className={`${inputClass} text-center px-2`}
                        min="0"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">£</span>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={e => handleUpdateLineItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          disabled={job.paymentStatus === 'paid'}
                          className={`${inputClass} pl-7 text-right`}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-900 text-right tabular-nums">
                        £{(item.qty * item.unitPrice).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemoveLineItem(item.id)}
                        disabled={job.paymentStatus === 'paid'}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Add blank line */}
                  {job.paymentStatus !== 'paid' && (
                    <button
                      onClick={handleAddLineItem}
                      className="flex items-center gap-1.5 px-4 h-9 rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 font-semibold hover:border-primary hover:text-primary transition-colors w-full justify-center"
                    >
                      <Plus className="h-4 w-4" /> Add Line Item
                    </button>
                  )}

                  {/* Totals */}
                  {lineItems.length > 0 && (
                    <div className="pt-4 border-t border-slate-100 space-y-2 ml-auto w-64">
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span className="tabular-nums">£{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-500">
                        <span>VAT ({vatRate}%)</span>
                        <span className="tabular-nums">£{vatAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                        <span>Total</span>
                        <span className="tabular-nums">£{invoiceTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {/* Invoice notes */}
                  <textarea
                    placeholder="Invoice notes (optional — shown on printed invoice)..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none text-slate-900 placeholder-slate-400 bg-white transition-all resize-none min-h-[60px]"
                    value={invoiceNotes}
                    onChange={e => setInvoiceNotes(e.target.value)}
                    disabled={job.paymentStatus === 'paid'}
                  />

                  {/* Invoice actions */}
                  <div className="flex gap-3 pt-2">
                    {job.paymentStatus !== 'paid' && (
                      <button
                        onClick={handleSaveInvoice}
                        disabled={lineItems.length === 0 || savingInvoice}
                        className="flex items-center gap-2 px-5 h-10 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {savingInvoice
                          ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          : null}
                        Save Invoice
                      </button>
                    )}
                    <button
                      onClick={handlePrintInvoice}
                      disabled={lineItems.length === 0}
                      className="flex items-center gap-2 px-5 h-10 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Printer className="h-4 w-4" />
                      Print / View Invoice
                    </button>
                  </div>
                </div>
              </div>

              {/* Photos */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-slate-900">Photos</h2>
                </div>
                <div className="px-8 py-8">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-400 hover:bg-slate-50 cursor-pointer transition-colors">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm font-medium">Click to upload vehicle photos</p>
                    <p className="text-[10px] mt-1 text-slate-400">(Mock functionality)</p>
                  </div>
                </div>
              </div>

              {/* Communication History */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-slate-900">Communication History</h2>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">Log phone calls, text messages, and emails with the customer.</p>
                </div>
                <div className="px-8 py-8 space-y-6">
                  {/* Log Form */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100 space-y-3">
                    <div className="flex items-center gap-3">
                      <select value={logType} onChange={(e) => setLogType(e.target.value as CommunicationLog['type'])} className={`${selectClass} w-32`}>
                        <option value="phone">Phone</option>
                        <option value="sms">SMS</option>
                        <option value="email">Email</option>
                        <option value="in-person">In Person</option>
                        <option value="system">System</option>
                      </select>
                      <input
                        placeholder="Enter communication details..."
                        className={`${inputClass} flex-1`}
                        value={logMessage}
                        onChange={(e) => setLogMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogCommunication()}
                      />
                      <button
                        onClick={handleLogCommunication}
                        disabled={!logMessage.trim()}
                        className="flex items-center gap-1 px-5 h-[42px] rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Log
                      </button>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4 pl-2">
                    {job.communications && job.communications.length > 0 ? (
                      [...job.communications].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(log => (
                        <div key={log.id} className="relative pl-7 pb-4 border-l-2 border-slate-200 last:border-l-0 last:pb-0">
                          <div className="absolute -left-[9px] top-0.5 bg-white p-1 rounded-full border-2 border-slate-200 shadow-sm">
                            {logIcon(log.type)}
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{log.type}</span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800 leading-relaxed">{log.message}</p>
                            <span className="text-[10px] text-slate-400 font-medium mt-0.5">Logged by {log.loggedBy}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-sm font-medium">
                        No communications logged yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status & Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="text-sm font-bold text-slate-900">Status & Actions</h2>
                </div>
                <div className="px-6 py-6 space-y-4">
                  <select value={job.status} onChange={handleStatusChange} className={`${selectClass} w-full`}>
                    <option value="waiting">Waiting</option>
                    <option value="in_bay">In Bay</option>
                    <option value="awaiting_approval">Awaiting Approval</option>
                    <option value="ready">Ready</option>
                    <option value="collected">Collected</option>
                  </select>

                  {/* Invoice total summary */}
                  {invoiceSaved && lineItems.length > 0 && (
                    <div className="flex justify-between items-center bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                      <span className="text-xs text-slate-500 font-medium">Invoice Total</span>
                      <span className="font-black text-slate-900 tabular-nums">£{invoiceTotal.toFixed(2)}</span>
                    </div>
                  )}

                  {job.paymentStatus === 'paid' ? (
                    <div className="space-y-3">
                      <div className="w-full h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 font-bold text-sm flex items-center justify-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Paid in Full
                        {job.invoice?.paymentMethod && (
                          <span className="text-[10px] font-bold uppercase tracking-wider ml-1 text-emerald-400">
                            ({job.invoice.paymentMethod})
                          </span>
                        )}
                      </div>
                      {lineItems.length > 0 && (
                        <button
                          onClick={handlePrintInvoice}
                          className="w-full h-10 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Printer className="h-4 w-4" />
                          View Invoice
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Mark as Paid (Cash / BACS) */}
                      <button
                        onClick={handleMarkPaidCash}
                        className="w-full h-11 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Banknote className="h-4 w-4" />
                        Mark as Paid (Cash / BACS)
                      </button>
                      {/* Stripe Terminal */}
                      <button
                        className="w-full h-11 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90 transition-all shadow-sm shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
                        onClick={handleTerminalPayment}
                        disabled={isProcessingPayment}
                      >
                        <CreditCard className="h-4 w-4" />
                        {isProcessingPayment ? 'Processing...' : 'Send to Card Machine'}
                      </button>
                      {terminalStatus && (
                        <div className="text-sm p-4 rounded-xl bg-primary/5 text-primary border border-primary/10 space-y-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 block">Terminal Status</span>
                          <span className="block text-sm">{terminalStatus}</span>
                          {terminalStatus.includes('Failed') && (
                            <button
                              className="mt-2 text-xs font-bold text-primary hover:underline"
                              onClick={() => {
                                setIsProcessingPayment(false);
                                setTerminalStatus(null);
                              }}
                            >
                              Dismiss
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-slate-900">Customer</h2>
                </div>
                <div className="px-6 py-6">
                  {customer ? (
                    <div className="space-y-4 text-sm">
                      <div className="space-y-1">
                        <p className="font-bold text-slate-900">{customer.name}</p>
                        <p className="text-slate-500">{customer.phone}</p>
                        <p className="text-slate-500">{customer.email || "No email"}</p>
                        <button className="text-primary text-xs font-bold hover:underline mt-2">View History</button>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            Authorized Contacts
                          </span>
                          <button
                            className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                            onClick={() => setShowContactForm(!showContactForm)}
                          >
                            <Plus className="h-3 w-3" /> Add
                          </button>
                        </div>

                        {job.authorizedContacts && job.authorizedContacts.length > 0 ? (
                          <ul className="space-y-2">
                            {job.authorizedContacts.map((contact, idx) => (
                              <li key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-800 text-xs">{contact.name}</span>
                                  <span className="text-[10px] text-slate-400">{contact.relation}</span>
                                </div>
                                <span className="text-slate-500 text-[10px] mt-0.5 block">{contact.phone}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic pb-2">No additional contacts authorized.</p>
                        )}

                        {showContactForm && (
                          <div className="mt-3 p-4 bg-primary/5 rounded-xl border border-primary/10 space-y-2">
                            <input className={`${inputClass} text-xs h-9`} placeholder="Name" value={newContactName} onChange={e => setNewContactName(e.target.value)} />
                            <input className={`${inputClass} text-xs h-9`} placeholder="Relation (e.g. Spouse)" value={newContactRelation} onChange={e => setNewContactRelation(e.target.value)} />
                            <input className={`${inputClass} text-xs h-9`} placeholder="Phone Number" value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} />
                            <div className="flex justify-end gap-2 pt-1">
                              <button className="text-xs font-bold text-slate-500 hover:text-slate-700" onClick={() => setShowContactForm(false)}>Cancel</button>
                              <button className="text-xs font-bold text-white bg-primary px-4 h-7 rounded-lg hover:bg-primary/90" onClick={handleAddContact}>Save</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 font-medium">Loading customer...</p>
                  )}
                </div>
              </div>

              {/* Vehicle */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-2">
                  <Car className="h-4 w-4 text-primary" />
                  <h2 className="text-sm font-bold text-slate-900">Vehicle</h2>
                </div>
                <div className="px-6 py-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reg</span>
                      <span className="font-black text-primary tracking-tight">{job.vehicle.registration}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Make</span>
                      <span className="font-bold text-slate-900">{job.vehicle.make}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model</span>
                      <span className="font-bold text-slate-900">{job.vehicle.model}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">VIN</span>
                      <span className="font-bold text-slate-900">{job.vehicle.vin || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

export default function JobDetailsPage() {
  return (
    <AuthProvider>
      <JobDetailsContent />
    </AuthProvider>
  );
}
