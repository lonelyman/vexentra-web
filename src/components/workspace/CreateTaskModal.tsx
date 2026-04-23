"use client";

import { useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTaskAction } from "@/app/actions/tasks";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

export default function CreateTaskModal({ projectId }: { projectId: string }) {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const [state, action, pending] = useActionState(createTaskAction, init);

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
            + สร้างงาน
         </button>

         <div ref={backdropRef} className="ws-dialog-backdrop">
            <div className="ws-dialog">
               <div className="ws-dialog-title">สร้างงานใหม่</div>

               {state.error && <div className="ws-form-error">{state.error}</div>}

               <form action={action}>
                  <input type="hidden" name="project_id" value={projectId} />

                  <div className="ws-form-group">
                     <label className="ws-form-label">ชื่องาน</label>
                     <input
                        type="text"
                        name="title"
                        placeholder="ระบุชื่องาน"
                        className="ws-form-input"
                        required
                        autoFocus
                     />
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">รายละเอียด</label>
                     <textarea name="description" className="ws-form-textarea" rows={2} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                     <div className="ws-form-group">
                        <label className="ws-form-label">ความสำคัญ</label>
                        <select name="priority" className="ws-form-select" defaultValue="medium">
                           <option value="high">สูง</option>
                           <option value="medium">ปานกลาง</option>
                           <option value="low">ต่ำ</option>
                        </select>
                     </div>

                     <div className="ws-form-group">
                        <label className="ws-form-label">กำหนดส่ง</label>
                        <input type="date" name="due_date" className="ws-form-input" />
                     </div>
                  </div>

                  <div className="ws-dialog-actions">
                     <button type="button" className="ws-btn-ghost" onClick={close}>
                        ยกเลิก
                     </button>
                     <button type="submit" className="ws-btn-primary" disabled={pending}>
                        {pending ? "กำลังสร้าง..." : "สร้างงาน"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
