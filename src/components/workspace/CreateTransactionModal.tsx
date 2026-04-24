"use client";

import { useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTransactionAction } from "@/app/actions/transactions";
import type { TransactionCategory } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

interface Props {
   projectId: string;
   categories: TransactionCategory[];
   disabled?: boolean;
}

export default function CreateTransactionModal({
   projectId,
   categories,
   disabled,
}: Props) {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const [state, action, pending] = useActionState(createTransactionAction, init);

   useEffect(() => {
      if (state.success) {
         backdropRef.current?.classList.remove("open");
         router.refresh();
      }
   }, [state.success, router]);

   const open = () => backdropRef.current?.classList.add("open");
   const close = () => backdropRef.current?.classList.remove("open");

   const today = new Date().toISOString().slice(0, 10);

   return (
      <>
         <button
            className="ws-btn-primary"
            onClick={open}
            disabled={disabled}
            title={disabled ? "โปรเจกต์ปิดแล้ว ไม่สามารถเพิ่มรายการได้" : undefined}
         >
            + เพิ่มรายการ
         </button>

         <div ref={backdropRef} className="ws-dialog-backdrop">
            <div className="ws-dialog">
               <div className="ws-dialog-title">เพิ่มรายการรับ-จ่าย</div>

               {state.error && (
                  <div className="ws-form-error">{state.error}</div>
               )}

               <form action={action}>
                  <input type="hidden" name="project_id" value={projectId} />

                  <div className="ws-form-group">
                     <label className="ws-form-label">ประเภทรายการ</label>
                     <select name="category_id" className="ws-form-select" required>
                        <option value="">— เลือกประเภท —</option>
                        {categories.map((cat) => (
                           <option key={cat.id} value={cat.id}>
                              {cat.name} ({cat.type === "income" ? "รายรับ" : "รายจ่าย"})
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">จำนวนเงิน (บาท)</label>
                     <input
                        type="number"
                        name="amount"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="ws-form-input"
                        required
                     />
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">วันที่</label>
                     <input
                        type="date"
                        name="occurred_at"
                        defaultValue={today}
                        className="ws-form-input"
                        required
                     />
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">หมายเหตุ</label>
                     <textarea name="note" className="ws-form-textarea" rows={2} />
                  </div>

                  <div className="ws-dialog-actions">
                     <button
                        type="button"
                        className="ws-btn-ghost"
                        onClick={close}
                     >
                        ยกเลิก
                     </button>
                     <button
                        type="submit"
                        className="ws-btn-primary"
                        disabled={pending}
                     >
                        {pending ? "กำลังบันทึก..." : "บันทึก"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
