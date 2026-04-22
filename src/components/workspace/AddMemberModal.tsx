"use client";

import { useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addMemberAction } from "@/app/actions/members";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

interface Props {
   projectId: string;
}

export default function AddMemberModal({ projectId }: Props) {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const [state, action, pending] = useActionState(addMemberAction, init);

   useEffect(() => {
      if (state.success) {
         backdropRef.current?.classList.remove("open");
         router.refresh();
      }
   }, [state.success, router]);

   const open = () => backdropRef.current?.classList.add("open");
   const close = () => backdropRef.current?.classList.remove("open");

   return (
      <>
         <button className="ws-btn-primary" onClick={open}>
            + เพิ่มสมาชิก
         </button>

         <div ref={backdropRef} className="ws-dialog-backdrop">
            <div className="ws-dialog">
               <div className="ws-dialog-title">เพิ่มสมาชิกเข้าโปรเจกต์</div>

               {state.error && (
                  <div className="ws-form-error">{state.error}</div>
               )}

               <form action={action}>
                  <input type="hidden" name="project_id" value={projectId} />

                  <div className="ws-form-group">
                     <label className="ws-form-label">Person ID</label>
                     <input
                        type="text"
                        name="person_id"
                        placeholder="UUID ของสมาชิก"
                        className="ws-form-input"
                        required
                     />
                     <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 4 }}>
                        ระบุ person_id ของผู้ใช้ที่ต้องการเพิ่มเข้าทีม
                     </p>
                  </div>

                  <div className="ws-dialog-actions">
                     <button type="button" className="ws-btn-ghost" onClick={close}>
                        ยกเลิก
                     </button>
                     <button type="submit" className="ws-btn-primary" disabled={pending}>
                        {pending ? "กำลังเพิ่ม..." : "เพิ่มสมาชิก"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
