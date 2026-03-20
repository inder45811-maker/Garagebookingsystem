
import { Job, Customer } from "@/types";
import { seedJobs, seedCustomers } from "@/data/seed";

// Simple in-memory store for MVP/Mocking
// In a real app, these would be Firestore calls

class MockStore {
  private jobs: Job[] = [...seedJobs];
  private customers: Customer[] = [...seedCustomers];

  // Jobs
  async getJobs(): Promise<Job[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return this.jobs;
  }

  async addJob(job: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> {
    let googleCalendarEventId;

    if (job.startTime && job.endTime) {
      try {
        const response = await fetch("/api/calendar/event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            summary: `${job.type} - ${job.vehicle.registration}`,
            description: job.description,
            startTime: new Date(job.startTime).toISOString(),
            endTime: new Date(job.endTime).toISOString()
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.eventId) {
            googleCalendarEventId = data.eventId;
          }
        }
      } catch (err) {
        console.error("Failed to sync to calendar", err);
      }
    }

    const newJob: Job = {
      ...job,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      googleCalendarEventId,
    };
    this.jobs.push(newJob);
    return newJob;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    const index = this.jobs.findIndex(j => j.id === id);
    if (index === -1) return null;

    this.jobs[index] = { ...this.jobs[index], ...updates, updatedAt: new Date().toISOString() };
    return this.jobs[index];
  }

  async deleteJob(id: string): Promise<boolean> {
    const initialLength = this.jobs.length;
    this.jobs = this.jobs.filter(j => j.id !== id);
    return this.jobs.length !== initialLength;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.customers;
  }

  async addCustomer(customer: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }
}

export const store = new MockStore();
