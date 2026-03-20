
import { Job, Customer } from "@/types";

export const seedCustomers: Customer[] = [
  {
    id: "c1",
    name: "John Smith",
    phone: "07700 900001",
    vehicleIds: ["v1"],
    createdAt: new Date().toISOString(),
    notes: "Prefers texts.",
  },
  {
    id: "c2",
    name: "Sarah Jones",
    phone: "07700 900002",
    vehicleIds: ["v2"],
    createdAt: new Date().toISOString(),
  },
  {
    id: "c3",
    name: "Mike Brown",
    phone: "07700 900003",
    vehicleIds: ["v3"],
    createdAt: new Date().toISOString(),
  },
];

export const seedJobs: Job[] = [
  {
    id: "j1",
    customerId: "c1",
    vehicle: {
      registration: "AB12 CDE",
      make: "Ford",
      model: "Focus",
    },
    type: "MOT",
    status: "waiting",
    description: "Annual MOT check",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    queuePosition: 0,
  },
  {
    id: "j2",
    customerId: "c2",
    vehicle: {
      registration: "XY55 ZAA",
      make: "BMW",
      model: "3 Series",
    },
    type: "Service",
    status: "in_bay",
    description: "Full service and oil change",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    queuePosition: 1,
  },
  {
    id: "j3",
    customerId: "c3",
    vehicle: {
      registration: "LM70 PPP",
      make: "Audi",
      model: "A4",
    },
    type: "Diagnostic",
    status: "ready",
    description: "Engine light on",
    quoteAmount: 85.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    queuePosition: 2,
  },
];
