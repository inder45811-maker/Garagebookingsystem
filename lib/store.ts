
import { Job, Customer } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";

/** Race a promise against a timeout — returns fallback on expiry */
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

const QUERY_TIMEOUT = 8000; // 8s — generous enough for cold starts

class FirestoreStore {
  // Jobs
  async getJobs(): Promise<Job[]> {
    if (!db) return [];
    try {
      const querySnapshot = await withTimeout(
        getDocs(collection(db, "jobs")),
        QUERY_TIMEOUT,
        null
      );
      if (!querySnapshot) {
        console.warn("[store] getJobs timed out after " + QUERY_TIMEOUT + "ms");
        return [];
      }
      return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Job));
    } catch (e) {
      console.error("Error getting jobs:", e);
      return [];
    }
  }

  async addJob(job: Omit<Job, "id" | "createdAt" | "updatedAt">): Promise<Job> {
    let googleCalendarEventId;

    if (job.startTime && job.endTime) {
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_BASE_URL || '');
        const url = baseUrl ? `${baseUrl}/api/calendar/event` : null;
        if (url && url.startsWith('http')) {
          const response = await fetch(url, {
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
        }
      } catch (err) {
        console.error("Failed to sync to calendar", err);
      }
    }

    const newJobData = {
      ...job,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(googleCalendarEventId && { googleCalendarEventId }),
    };

    if (!db) throw new Error("Firestore not initialized");
    const docRef = await addDoc(collection(db, "jobs"), newJobData);
    
    return {
      id: docRef.id,
      ...newJobData,
    } as Job;
  }

  async updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
    if (!db) throw new Error("Firestore not initialized");
    const jobRef = doc(db, "jobs", id);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(jobRef, updateData);
    
    const updatedSnap = await getDoc(jobRef);
    if (!updatedSnap.exists()) return null;
    return { id: updatedSnap.id, ...updatedSnap.data() } as Job;
  }

  async deleteJob(id: string): Promise<boolean> {
    if (!db) return false;
    const jobRef = doc(db, "jobs", id);
    await deleteDoc(jobRef);
    return true;
  }

  // Customers
  async getCustomers(): Promise<Customer[]> {
    if (!db) return [];
    try {
      const querySnapshot = await withTimeout(
        getDocs(collection(db, "customers")),
        QUERY_TIMEOUT,
        null
      );
      if (!querySnapshot) {
        console.warn("[store] getCustomers timed out after " + QUERY_TIMEOUT + "ms");
        return [];
      }
      return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Customer));
    } catch (e) {
      console.error("Error getting customers:", e);
      return [];
    }
  }

  async addCustomer(customer: Omit<Customer, "id" | "createdAt">): Promise<Customer> {
    const newCustomerData = {
      ...customer,
      createdAt: new Date().toISOString(),
    };
    
    if (!db) throw new Error("Firestore not initialized");
    const docRef = await addDoc(collection(db, "customers"), newCustomerData);
    
    return {
      id: docRef.id,
      ...newCustomerData,
    } as Customer;
  }
}

export const store = new FirestoreStore();

