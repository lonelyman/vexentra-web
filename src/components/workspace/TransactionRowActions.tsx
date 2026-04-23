"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
   deleteTransactionAction,
   updateTransactionAction,
} from "@/app/actions/transactions";
import type { Transaction, TransactionCategory } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };
const initialState: ActionState = {};

interface TransactionRowActionsProps {
   projectId: string;
   tx: Transaction;
   categories: TransactionCategory[];
   disabled?: boolean;
}

export default function TransactionRowActions({
   projectId,
   tx,
   categories,
   disabled,
}: TransactionRowActionsProps) {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const [updateState, updateAction, updatePending] = useActionState(
      updateTransactionAction,
      initialState,
   );
   const [deleteState, deleteAction, deletePending] = useActionState(
      deleteTransactionAction,
      initialState,
   );

   useEffect(() => {
      if (!updateState.success && !deleteState.success) return;
      backdropRef.current?.classList.remove("open");
      router.refresh();
   }, [updateState.success, deleteState.success, router]);

   const open = () => backdropRef.current?.classList.add("open");
   const close = () => backdropRef.current?.classList.remove("open");
   const occurredDate = new Date(tx.occurred_at).toISOString().slice(0, 10);

   return (
      <>
         <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
               type="button"
               className="ws-btn-ghost ws-btn-sm"
               onClick={open}
               disabled={disabled}
            >
               แก้ไข
            </button>
            <form action={deleteAction}>
               <input type="hidden" name="project_id" value={projectId} />
               <input type="hidden" name="tx_id" value={tx.id} />
               <button
                  type="submit"
                  className="ws-btn-danger-ghost ws-btn-sm"
                  disabled={disabled || deletePending}
                  onClick={(e) => {
                     if (!confirm("ยืนยันลบรายการนี้?")) e.preventDefault();
                  }}
               >
                  {deletePending ? "กำลังลบ..." : "ลบ"}
               </button>
            </form>
         </div>

         <div ref={backdropRef} className="ws-dialog-backdrop">
            <div className="ws-dialog">
               <div className="ws-dialog-title">แก้ไขรายการรับ-จ่าย</div>

               {(updateState.error || deleteState.error) && (
                  <div className="ws-form-error">
                     {updateState.error || deleteState.error}
                  </div>
               )}

               <form action={updateAction}>
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="tx_id" value={tx.id} />

                  <div className="ws-form-group">
                     <label className="ws-form-label">ประเภทรายการ</label>
                     <select
                        name="category_id"
                        className="ws-form-select"
                        defaultValue={tx.category_id}
                        required
                        disabled={disabled || updatePending}
                     >
                        {categories.map((cat) => (
                           <option key={cat.id} value={cat.id}>
                              {cat.name} (
                              {cat.type === "income" ? "รายรับ" : "รายจ่าย"})
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
                        defaultValue={tx.amount}
                        className="ws-form-input"
                        required
                        disabled={disabled || updatePending}
                     />
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">วันที่</label>
                     <input
                        type="date"
                        name="occurred_at"
                        defaultValue={occurredDate}
                        className="ws-form-input"
                        required
                        disabled={disabled || updatePending}
                     />
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">หมายเหตุ</label>
                     <textarea
                        name="note"
                        className="ws-form-textarea"
                        rows={2}
                        defaultValue={tx.note ?? ""}
                        disabled={disabled || updatePending}
                     />
                  </div>

                  <div className="ws-dialog-actions">
                     <button
                        type="button"
                        className="ws-btn-ghost"
                        onClick={close}
                        disabled={updatePending}
                     >
                        ยกเลิก
                     </button>
                     <button
                        type="submit"
                        className="ws-btn-primary"
                        disabled={disabled || updatePending}
                     >
                        {updatePending ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
