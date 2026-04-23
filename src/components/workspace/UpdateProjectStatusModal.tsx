"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { updateProjectStatusAction } from "@/app/actions/projects";
import type { ProjectKind, ProjectStatus } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };

const initialState: ActionState = {};
const CLOSE_REASON_OPTIONS: { value: string; label: string }[] = [
   { value: "won_completed", label: "งานสำเร็จลุล่วง" },
   { value: "lost_to_competitor", label: "แพ้ประมูลให้คู่แข่ง" },
   { value: "client_declined", label: "ลูกค้าปฏิเสธโครงการ" },
   { value: "we_withdrew", label: "เราเป็นฝ่ายถอนตัวเอง" },
   { value: "client_abandoned", label: "ลูกค้าทิ้งงาน/ติดต่อไม่ได้" },
   { value: "budget_cut", label: "โครงการถูกตัดงบประมาณ" },
   { value: "cancelled_internal", label: "ยกเลิกภายในทีมเอง" },
];

interface UpdateProjectStatusModalProps {
   project: {
      id: string;
      project_code: string;
      name: string;
      project_kind: ProjectKind;
      status: ProjectStatus;
      description: string | null;
      client_person_id: string | null;
      client_name_raw: string | null;
      client_email_raw: string | null;
      scheduled_start_at: string | null;
      deadline_at: string | null;
   };
   options: Array<{ value: ProjectStatus; label: string }>;
   canEditClosedStatus?: boolean;
}

export default function UpdateProjectStatusModal({
   project,
   options,
   canEditClosedStatus = false,
}: UpdateProjectStatusModalProps) {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const [selectedStatus, setSelectedStatus] = useState<ProjectStatus>(
      project.status,
   );
   const [selectedProjectKind, setSelectedProjectKind] = useState<ProjectKind>(
      project.project_kind,
   );
   const [state, action, pending] = useActionState(
      updateProjectStatusAction,
      initialState,
   );

   useEffect(() => {
      if (!state.success) return;
      backdropRef.current?.classList.remove("open");
      router.refresh();
   }, [state.success, router]);

   const isClosed = project.status === "closed";
   const isReadOnlyClosed = isClosed && !canEditClosedStatus;
   const open = () => backdropRef.current?.classList.add("open");
   const close = () => backdropRef.current?.classList.remove("open");

   function onBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
      if (e.target === backdropRef.current) close();
   }

   return (
      <>
         <button
            className="ws-btn-ghost"
            onClick={open}
            disabled={isReadOnlyClosed}
         >
            เปลี่ยนสถานะ
         </button>

         <div
            ref={backdropRef}
            className="ws-dialog-backdrop"
            onClick={onBackdropClick}
         >
            <div className="ws-dialog" role="dialog" aria-modal="true">
               <h2 className="ws-dialog-title">เปลี่ยนสถานะโปรเจกต์</h2>

               <form action={action}>
                  <input type="hidden" name="project_id" value={project.id} />
                  <input
                     type="hidden"
                     name="project_code"
                     value={project.project_code}
                  />
                  <input type="hidden" name="name" value={project.name} />
                  <input
                     type="hidden"
                     name="description"
                     value={project.description ?? ""}
                  />
                  <input
                     type="hidden"
                     name="client_person_id"
                     value={project.client_person_id ?? ""}
                  />
                  <input
                     type="hidden"
                     name="client_name_raw"
                     value={project.client_name_raw ?? ""}
                  />
                  <input
                     type="hidden"
                     name="client_email_raw"
                     value={project.client_email_raw ?? ""}
                  />
                  <input
                     type="hidden"
                     name="scheduled_start_at"
                     value={project.scheduled_start_at ?? ""}
                  />
                  <input
                     type="hidden"
                     name="deadline_at"
                     value={project.deadline_at ?? ""}
                  />

                  {state.error && (
                     <div className="ws-form-error">{state.error}</div>
                  )}

                  <div className="ws-form-group">
                     <label className="ws-form-label" htmlFor="project-kind">
                        ประเภทโครงการ
                     </label>
                     <select
                        id="project-kind"
                        name="project_kind"
                        className="ws-form-select"
                        value={selectedProjectKind}
                        onChange={(e) =>
                           setSelectedProjectKind(e.target.value as ProjectKind)
                        }
                        disabled={pending}
                     >
                        <option value="client_delivery">งานลูกค้า (Client Delivery)</option>
                        <option value="internal_continuous">งานภายในต่อเนื่อง (Internal)</option>
                     </select>
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label" htmlFor="project-status">
                        สถานะใหม่
                     </label>
                     <select
                        id="project-status"
                        name="status"
                        className="ws-form-select"
                        value={selectedStatus}
                        onChange={(e) =>
                           setSelectedStatus(e.target.value as ProjectStatus)
                        }
                        disabled={pending}
                     >
                        {options.map((opt) => (
                           <option key={opt.value} value={opt.value}>
                              {opt.label}
                           </option>
                        ))}
                     </select>
                  </div>

                  {selectedProjectKind === "internal_continuous" && (
                     <div className="ws-form-help">
                        โหมดงานภายใน: อนุญาต active/on_hold โดยไม่ต้องระบุลูกค้า
                     </div>
                  )}

                  {selectedStatus === "closed" && (
                     <>
                        <div className="ws-form-group">
                           <label
                              className="ws-form-label"
                              htmlFor="project-close-reason"
                           >
                              เหตุผลการปิดโครงการ
                           </label>
                           <select
                              id="project-close-reason"
                              name="reason"
                              className="ws-form-select"
                              defaultValue=""
                              disabled={pending}
                              required
                           >
                              <option value="" disabled>
                                 เลือกเหตุผล
                              </option>
                              {CLOSE_REASON_OPTIONS.map((opt) => (
                                 <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className="ws-form-group">
                           <label
                              className="ws-form-label"
                              htmlFor="project-closed-at"
                           >
                              วันที่ปิดโครงการ
                           </label>
                           <input
                              id="project-closed-at"
                              name="closed_at"
                              type="date"
                              className="ws-form-input"
                              defaultValue={new Date().toISOString().slice(0, 10)}
                              disabled={pending}
                              required
                           />
                        </div>
                     </>
                  )}

                  <div className="ws-dialog-actions">
                     <button
                        type="button"
                        className="ws-btn-ghost"
                        onClick={close}
                        disabled={pending}
                     >
                        ยกเลิก
                     </button>
                     <button
                        type="submit"
                        className={
                           selectedStatus === "closed"
                              ? "ws-btn-danger-ghost"
                              : "ws-btn-primary"
                        }
                        disabled={pending}
                     >
                        {pending
                           ? "กำลังบันทึก..."
                           : selectedStatus === "closed"
                             ? "ปิดโครงการ"
                             : "บันทึกสถานะ"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
