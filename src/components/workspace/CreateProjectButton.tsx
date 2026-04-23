"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createProjectAction } from "@/app/actions/projects";

const initialState = { error: undefined, success: undefined };

export default function CreateProjectButton() {
   const router = useRouter();
   const dialogRef = useRef<HTMLDivElement>(null);
   const nameRef = useRef<HTMLInputElement>(null);
   const [state, dispatch, pending] = useActionState(createProjectAction, initialState);

   // close dialog + refresh list on success
   useEffect(() => {
      if (state.success) {
         closeDialog();
         router.refresh();
      }
   }, [state.success, router]);

   function openDialog() {
      dialogRef.current?.classList.add("open");
      setTimeout(() => nameRef.current?.focus(), 50);
   }

   function closeDialog() {
      dialogRef.current?.classList.remove("open");
   }

   function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
      if (e.target === dialogRef.current) closeDialog();
   }

   return (
      <>
         <button className="ws-btn-primary" onClick={openDialog}>
            <svg
               xmlns="http://www.w3.org/2000/svg"
               fill="none"
               viewBox="0 0 24 24"
               strokeWidth={2}
               stroke="currentColor"
               width={15}
               height={15}
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
               />
            </svg>
            สร้างโปรเจกต์
         </button>

         {/* Dialog backdrop */}
         <div
            ref={dialogRef}
            className="ws-dialog-backdrop"
            onClick={handleBackdropClick}
         >
            <div className="ws-dialog" role="dialog" aria-modal="true">
               <h2 className="ws-dialog-title">สร้างโปรเจกต์ใหม่</h2>

               <form action={dispatch}>
                  {state.error && (
                     <div className="ws-form-error">{state.error}</div>
                  )}

                  <div className="ws-form-group">
                     <label className="ws-form-label" htmlFor="proj-name">
                        ชื่อโปรเจกต์
                     </label>
                     <input
                        ref={nameRef}
                        id="proj-name"
                        name="name"
                        type="text"
                        className="ws-form-input"
                        placeholder="เช่น Website Redesign 2026"
                        maxLength={200}
                        required
                     />
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label" htmlFor="proj-kind">
                        ประเภทโครงการ
                     </label>
                     <select
                        id="proj-kind"
                        name="project_kind"
                        className="ws-form-select"
                        defaultValue="client_delivery"
                     >
                        <option value="client_delivery">งานลูกค้า (Client Delivery)</option>
                        <option value="internal_continuous">งานภายในต่อเนื่อง (Internal)</option>
                     </select>
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label" htmlFor="proj-desc">
                        รายละเอียด
                     </label>
                     <textarea
                        id="proj-desc"
                        name="description"
                        className="ws-form-textarea"
                        placeholder="อธิบายโปรเจกต์นี้โดยย่อ..."
                        rows={3}
                     />
                  </div>

                  <div className="ws-dialog-actions">
                     <button
                        type="button"
                        className="ws-btn-ghost"
                        onClick={closeDialog}
                        disabled={pending}
                     >
                        ยกเลิก
                     </button>
                     <button
                        type="submit"
                        className="ws-btn-primary"
                        disabled={pending}
                     >
                        {pending ? "กำลังสร้าง..." : "สร้างโปรเจกต์"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
