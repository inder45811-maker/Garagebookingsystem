
export type JobStatus = 'waiting' | 'in_bay' | 'awaiting_approval' | 'pending_approval' | 'ready' | 'collected';

export interface Vehicle {
  registration: string;
  make: string;
  model: string;
  year?: string;
  color?: string;
  vin?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
  vehicleIds: string[]; // references to Vehicle
  createdAt: string;
}

export interface Contact {
  name: string;
  relation: string; // e.g., 'Spouse', 'Fleet Manager'
  phone: string;
}

export interface CommunicationLog {
  id: string;
  timestamp: string;
  type: 'sms' | 'email' | 'phone' | 'in-person' | 'system';
  message: string;
  loggedBy: string; // User name or 'Automated System'
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Invoice {
  lineItems: InvoiceLineItem[];
  vatRate: number; // percentage e.g. 20
  notes?: string;
  createdAt: string;
  status: 'draft' | 'issued' | 'paid';
  paymentMethod?: 'card' | 'cash' | 'bacs';
  paidAt?: string;
}

export interface Job {
  id: string;
  customerId: string;
  vehicle: Vehicle;
  type: string; // e.g., "MOT", "Service", "Diagnostic"
  status: JobStatus;
  description: string;
  internalNotes?: string;
  quoteAmount?: number;
  createdAt: string;
  updatedAt: string;
  queuePosition: number;
  estimatedCompletion?: string;
  startTime?: string;
  endTime?: string;
  googleCalendarEventId?: string;
  assignedMechanicId?: string;
  assignedMechanicName?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  paymentIntentId?: string;
  authorizedContacts?: Contact[];
  communications?: CommunicationLog[];
  invoice?: Invoice;
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'mechanic';
  name: string;
  garageId: string;
}

export interface Settings {
  businessName: string;
  openingHours: string;
  hourlyRate: number;
  googleReviewsLink?: string;
  registeredReaders?: {
    readerId: string;
    label: string;
    ipAddress?: string;
  }[];
  defaultReaderId?: string;
}
