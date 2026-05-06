
import { useState } from "react";
import { Job } from "@/types";
import { Draggable } from "@hello-pangea/dnd";
import { Clock, User } from "lucide-react";
import Link from "next/link";

import { useUserRole, useAuth } from "@/contexts/AuthContext";
import { store } from "@/lib/store";

// Mechanic list — matches the team page seed data
// In production this would come from Firestore
const MECHANICS = [
  { id: "m1", name: "David Tech" },
];

interface JobCardProps {
  job: Job;
  index: number;
  onJobUpdate: () => void;
}

export function JobCard({ job, index, onJobUpdate }: JobCardProps) {
  const { isAdmin, isMechanic } = useUserRole();
  const { user } = useAuth();
  const [assigning, setAssigning] = useState(false);

  const handleClaim = async () => {
    if (!user) return;
    await store.updateJob(job.id, {
      assignedMechanicId: user.id,
      assignedMechanicName: user.name
    });
    onJobUpdate();
  };

  const handleUnassign = async () => {
    await store.updateJob(job.id, {
      assignedMechanicId: '',
      assignedMechanicName: ''
    });
    onJobUpdate();
  };

  const handleAssign = async (mechanicId: string) => {
    const mechanic = MECHANICS.find(m => m.id === mechanicId);
    if (!mechanic) return;
    setAssigning(true);
    await store.updateJob(job.id, {
      assignedMechanicId: mechanic.id,
      assignedMechanicName: mechanic.name
    });
    onJobUpdate();
    setAssigning(false);
  };

  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-4"
        >
          <Link href={`/jobs/${job.id}`} className="block">
            <div className={`bg-white p-5 rounded-xl border flex flex-col gap-4 transition-all
              ${snapshot.isDragging ? 'shadow-2xl border-primary ring-2 ring-primary/20 cursor-grabbing' : 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-slate-100 cursor-grab hover:shadow-md'}
              ${job.status === 'in_bay' ? 'border-l-4 border-l-primary' : ''}
              ${job.status === 'ready' ? 'opacity-90 hover:opacity-100' : ''}
            `}>
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-primary font-black text-lg tracking-tight">{job.vehicle.registration}</span>
                  <span className="text-slate-900 font-bold text-sm">{job.vehicle.make} {job.vehicle.model}</span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-md uppercase">
                    {job.type}
                  </span>
                  {job.status === 'in_bay' && (
                    <span className="text-[10px] text-blue-500 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Active
                    </span>
                  )}
                  {job.status === 'awaiting_approval' && (
                    <span className="bg-amber-50 text-amber-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase border border-amber-100 mt-1">Pending</span>
                  )}
                  {job.status === 'ready' && (
                    <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-1 rounded-md uppercase border border-emerald-100 mt-1">Done</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 overflow-hidden shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-900 text-xs font-bold line-clamp-1">Customer ID: {job.customerId.slice(0, 5)}</span>
                    {job.assignedMechanicName ? (
                      <span className="text-slate-500 text-[10px] font-medium flex items-center gap-2">
                        Mech: {job.assignedMechanicName}
                        {/* Drop Button inside the tech area */}
                        {(isAdmin || (isMechanic && job.assignedMechanicId === user?.id)) && (
                          <button
                            onClick={(e) => { e.preventDefault(); handleUnassign(); }}
                            className="text-[10px] text-red-400 hover:text-red-500 hover:underline z-10 relative"
                          >
                            Drop
                          </button>
                        )}
                      </span>
                    ) : (
                      <div className="mt-1" onClick={e => e.preventDefault()}>
                        {isMechanic && (
                          <button
                            onClick={(e) => { e.preventDefault(); handleClaim(); }}
                            className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded shadow-sm hover:bg-primary/90 transition-colors z-10 relative"
                          >
                            Claim Job
                          </button>
                        )}
                        {isAdmin && (
                          <select
                            defaultValue=""
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => { e.preventDefault(); handleAssign(e.target.value); }}
                            disabled={assigning}
                            className="text-[10px] font-bold border border-slate-200 rounded px-1 py-0.5 bg-white text-slate-600 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-primary z-10 relative cursor-pointer"
                          >
                            <option value="" disabled>Assign Tech</option>
                            {MECHANICS.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px] font-medium mr-1">{new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      )}
    </Draggable>
  );
}
