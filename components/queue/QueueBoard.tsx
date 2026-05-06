
"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Job, JobStatus } from "@/types";
import { JobCard } from "./JobCard";
import { store } from "@/lib/store";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";



const COLUMNS: { id: JobStatus; title: string }[] = [
  { id: "waiting", title: "Waiting" },
  { id: "in_bay", title: "In Bay" },
  { id: "awaiting_approval", title: "Approval Needed" },
  { id: "ready", title: "Ready" },
  { id: "collected", title: "Collected" },
];

export function QueueBoard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadJobs = async () => {
    const data = await store.getJobs();
    setJobs(data);
    setLoading(false);
  };

  const handleApproveBooking = async (jobId: string) => {
    setApprovingId(jobId);
    await store.updateJob(jobId, { status: 'waiting' });
    await loadJobs();
    setApprovingId(null);
  };

  const handleRejectBooking = async (jobId: string) => {
    setApprovingId(jobId);
    // Delete the rejected booking entirely so it doesn't corrupt analytics (fixes M-3)
    await store.deleteJob(jobId);
    await loadJobs();
    setApprovingId(null);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadJobs();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as JobStatus;

    // Optimistically update UI
    const updatedJobs = jobs.map(job => {
      if (job.id === draggableId) {
        return { ...job, status: newStatus };
      }
      return job;
    });
    setJobs(updatedJobs);

    // Update backend
    await store.updateJob(draggableId, { status: newStatus });
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>;
  }

  const pendingBookings = jobs.filter(j => j.status === 'pending_approval');
  const activeJobs = jobs.filter(j => j.status !== 'pending_approval');

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)] pb-4 font-sans">
      {/* Pending Approvals Section */}
      {pendingBookings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-2 shadow-sm shrink-0">
          <h2 className="text-lg font-bold text-amber-800 mb-4 flex items-center gap-2">
            Pending Online Bookings
            <span className="bg-amber-200 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">{pendingBookings.length}</span>
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {pendingBookings.map(job => (
              <div key={job.id} className="min-w-[320px] bg-white border border-amber-100 p-5 rounded-xl shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-start">
                  <span className="font-black text-lg text-primary tracking-tight">{job.vehicle.registration}</span>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 uppercase">{new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{job.vehicle.make} {job.vehicle.model}</div>
                <p className="text-xs text-slate-500 line-clamp-2">{job.description}</p>
                <div className="flex gap-2 mt-2 pt-3 border-t border-slate-50">
                  <Button
                    size="sm"
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-9 shadow-sm shadow-emerald-500/20"
                    onClick={() => handleApproveBooking(job.id)}
                    disabled={approvingId === job.id}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-rose-500 border-rose-200 hover:bg-rose-50 font-bold h-9"
                    onClick={() => handleRejectBooking(job.id)}
                    disabled={approvingId === job.id}
                  >
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Drag/Drop Queue (Kanban Board) */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 overflow-x-auto flex-1 h-full pb-6 px-1">
          {COLUMNS.map((col) => {
            const columnJobs = activeJobs.filter((j) => j.status === col.id);

            // Determine column header tag color based on status
            let badgeStyle = "bg-slate-200 text-slate-600";
            if (col.id === 'in_bay') badgeStyle = "bg-primary text-white";
            if (col.id === 'awaiting_approval') badgeStyle = "bg-amber-100 text-amber-700";
            if (col.id === 'ready') badgeStyle = "bg-emerald-100 text-emerald-700";
            if (col.id === 'collected') badgeStyle = "bg-indigo-100 text-indigo-700";

            return (
              <div key={col.id} className="flex flex-col gap-4 min-w-[320px] w-1/4 max-w-[400px]">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-slate-600 font-bold text-sm uppercase tracking-wider">{col.title}</h3>
                    <span className={`${badgeStyle} text-xs font-bold px-2 py-0.5 rounded-full`}>{columnJobs.length}</span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                  </button>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 overflow-y-auto min-h-[150px] flex flex-col gap-3 transition-colors rounded-2xl p-3
                        ${col.id === 'in_bay' ? 'bg-slate-100/50 border-2 border-dashed border-slate-200' : 'bg-slate-50 border border-slate-100'}
                        ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20 border-transparent' : ''}
                      `}
                    >
                      {columnJobs.map((job, index) => (
                        <JobCard key={job.id} job={job} index={index} onJobUpdate={loadJobs} />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
