"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { upsertProjectFinancialPlanAction } from "@/app/actions/projects";
import type {
   ProjectFinancialPlan,
   ProjectKind,
   ProjectPaymentInstallment,
} from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };
const initialState: ActionState = {};

interface InstallmentFormItem {
   sort_order: number;
   title: string;
   amount: string;
   planned_delivery_date: string;
   planned_receive_date: string;
   note: string;
}

interface Props {
   projectId: string;
   projectCode: string;
   projectKind: ProjectKind;
   initialPlan: ProjectFinancialPlan | null;
   canEdit: boolean;
}

function toDateInput(v: string | null | undefined): string {
   if (!v) return "";
   const d = new Date(v);
   if (Number.isNaN(d.getTime())) return "";
   return d.toISOString().slice(0, 10);
}

function fromApiInstallments(items: ProjectPaymentInstallment[] | undefined): InstallmentFormItem[] {
   if (!items || items.length === 0) return [];
   return items
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((i, idx) => ({
         sort_order: i.sort_order || idx + 1,
         title: i.title || "",
         amount: i.amount || "",
         planned_delivery_date: toDateInput(i.planned_delivery_date),
         planned_receive_date: toDateInput(i.planned_receive_date),
         note: i.note || "",
      }));
}

export default function ProjectFinancialPlanEditor({
   projectId,
   projectCode,
   projectKind,
   initialPlan,
   canEdit,
}: Props) {
   const router = useRouter();
   const [state, action, pending] = useActionState(
      upsertProjectFinancialPlanAction,
      initialState,
   );

   const [installments, setInstallments] = useState<InstallmentFormItem[]>(
      fromApiInstallments(initialPlan?.installments),
   );

   useEffect(() => {
      if (!state.success) return;
      router.refresh();
   }, [state.success, router]);

   const contractAmount = String(initialPlan?.contract_amount ?? "0");
   const retentionAmount = String(initialPlan?.retention_amount ?? "0");
   const plannedDeliveryDate = toDateInput(initialPlan?.planned_delivery_date);

   const installmentsJSON = useMemo(
      () => JSON.stringify(installments),
      [installments],
   );
   const isInternalProject = projectKind === "internal_continuous";
   const submittedInstallmentsJSON = isInternalProject ? "[]" : installmentsJSON;

   const plannedTotal = installments.reduce((sum, item) => {
      const n = Number(item.amount || 0);
      return sum + (Number.isFinite(n) ? n : 0);
   }, 0);

   const addInstallment = () => {
      setInstallments((prev) => [
         ...prev,
         {
            sort_order: prev.length + 1,
            title: "",
            amount: "",
            planned_delivery_date: "",
            planned_receive_date: "",
            note: "",
         },
      ]);
   };

   const removeInstallment = (idx: number) => {
      setInstallments((prev) =>
         prev
            .filter((_, i) => i !== idx)
            .map((item, i) => ({ ...item, sort_order: i + 1 })),
      );
   };

   const updateInstallment = (
      idx: number,
      key: keyof InstallmentFormItem,
      value: string | number,
   ) => {
      setInstallments((prev) =>
         prev.map((item, i) =>
            i === idx ? { ...item, [key]: value } : item,
         ),
      );
   };

   return (
      <form action={action} className="ws-fin-card">
         <input type="hidden" name="project_id" value={projectId} />
         <input type="hidden" name="project_code" value={projectCode} />
         <input
            type="hidden"
            name="installments_json"
            value={submittedInstallmentsJSON}
         />

         <div className="ws-fin-grid">
            <div className="ws-form-group">
               <label className="ws-form-label">ค่าจ้างตามสัญญา (บาท)</label>
               <input
                  type="number"
                  name="contract_amount"
                  className="ws-form-input"
                  step="0.01"
                  min="0"
                  defaultValue={contractAmount}
                  disabled={!canEdit || pending}
                  required
               />
            </div>

            <div className="ws-form-group">
               <label className="ws-form-label">เงินประกันที่หัก (บาท)</label>
               <input
                  type="number"
                  name="retention_amount"
                  className="ws-form-input"
                  step="0.01"
                  min="0"
                  defaultValue={retentionAmount}
                  disabled={!canEdit || pending}
               />
            </div>

            {!isInternalProject && (
               <div className="ws-form-group">
                  <label className="ws-form-label">กำหนดส่งมอบงานรวม</label>
                  <input
                     type="date"
                     name="planned_delivery_date"
                     className="ws-form-input"
                     defaultValue={plannedDeliveryDate}
                     disabled={!canEdit || pending}
                  />
               </div>
            )}
         </div>

         {isInternalProject && (
            <div className="ws-form-help" style={{ marginBottom: 14 }}>
               โปรเจกต์ภายใน: ซ่อนงวดรับเงินและวันส่งมอบรวม
            </div>
         )}

         <div className="ws-form-group">
            <label className="ws-form-label">เงื่อนไขการชำระเงิน</label>
            <textarea
               name="payment_note"
               className="ws-form-textarea"
               rows={3}
               defaultValue={initialPlan?.payment_note ?? ""}
               disabled={!canEdit || pending}
               placeholder="เช่น รับเงินภายใน 15 วันหลังส่งมอบแต่ละงวด"
            />
         </div>

         {!isInternalProject && (
            <div className="ws-fin-subheader">
               <div className="ws-fin-subtitle">งวดรับเงิน</div>
               <button
                  type="button"
                  className="ws-btn-ghost ws-btn-sm"
                  onClick={addInstallment}
                  disabled={!canEdit || pending}
               >
                  + เพิ่มงวด
               </button>
            </div>
         )}

         {!isInternalProject &&
            (installments.length === 0 ? (
               <div className="ws-empty" style={{ marginBottom: 14 }}>
                  <div className="ws-empty-title">ยังไม่มีงวดรับเงิน</div>
                  <div className="ws-empty-desc">เพิ่มงวดเพื่อระบุวันส่งงานและวันรับเงิน</div>
               </div>
            ) : (
               <div className="ws-fin-list">
                  {installments.map((item, idx) => (
                     <div key={`installment-${idx}`} className="ws-fin-item">
                     <div className="ws-fin-item-head">
                        <span>งวดที่ {idx + 1}</span>
                        <button
                           type="button"
                           className="ws-btn-danger-ghost ws-btn-sm"
                           onClick={() => removeInstallment(idx)}
                           disabled={!canEdit || pending}
                        >
                           ลบ
                        </button>
                     </div>
                     <div className="ws-fin-grid">
                        <div className="ws-form-group">
                           <label className="ws-form-label">ชื่องวด</label>
                           <input
                              className="ws-form-input"
                              value={item.title}
                              onChange={(e) =>
                                 updateInstallment(idx, "title", e.target.value)
                              }
                              disabled={!canEdit || pending}
                              placeholder="เช่น งวดมัดจำ"
                           />
                        </div>
                        <div className="ws-form-group">
                           <label className="ws-form-label">จำนวนเงิน (บาท)</label>
                           <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="ws-form-input"
                              value={item.amount}
                              onChange={(e) =>
                                 updateInstallment(idx, "amount", e.target.value)
                              }
                              disabled={!canEdit || pending}
                           />
                        </div>
                        <div className="ws-form-group">
                           <label className="ws-form-label">กำหนดส่งงานงวดนี้</label>
                           <input
                              type="date"
                              className="ws-form-input"
                              value={item.planned_delivery_date}
                              onChange={(e) =>
                                 updateInstallment(
                                    idx,
                                    "planned_delivery_date",
                                    e.target.value,
                                 )
                              }
                              disabled={!canEdit || pending}
                           />
                        </div>
                        <div className="ws-form-group">
                           <label className="ws-form-label">กำหนดรับเงินงวดนี้</label>
                           <input
                              type="date"
                              className="ws-form-input"
                              value={item.planned_receive_date}
                              onChange={(e) =>
                                 updateInstallment(
                                    idx,
                                    "planned_receive_date",
                                    e.target.value,
                                 )
                              }
                              disabled={!canEdit || pending}
                           />
                        </div>
                     </div>
                     <div className="ws-form-group">
                        <label className="ws-form-label">หมายเหตุ</label>
                        <textarea
                           className="ws-form-textarea"
                           rows={2}
                           value={item.note}
                           onChange={(e) =>
                              updateInstallment(idx, "note", e.target.value)
                           }
                           disabled={!canEdit || pending}
                        />
                     </div>
                     </div>
                  ))}
               </div>
            ))}

         <div className="ws-summary-grid" style={{ marginTop: 16 }}>
            <div className="ws-summary-card">
               <div className="ws-summary-label">รวมงวดที่วางไว้</div>
               <div className="ws-summary-amount">฿{plannedTotal.toLocaleString("th-TH")}</div>
            </div>
            <div className="ws-summary-card">
               <div className="ws-summary-label">ยอดสุทธิหลังหักประกัน</div>
               <div className="ws-summary-amount">
                  ฿{Number(initialPlan?.net_receivable ?? 0).toLocaleString("th-TH")}
               </div>
            </div>
            <div className="ws-summary-card">
               <div className="ws-summary-label">ยอดที่ยังไม่จัดสรร</div>
               <div className="ws-summary-amount">
                  ฿{Number(initialPlan?.unallocated_remaining ?? 0).toLocaleString("th-TH")}
               </div>
            </div>
         </div>

         {state.error && <div className="ws-form-error">{state.error}</div>}

         <div className="ws-dialog-actions">
            <button
               type="submit"
               className="ws-btn-primary"
               disabled={!canEdit || pending}
            >
               {pending ? "กำลังบันทึก..." : "บันทึกแผนค่าจ้าง"}
            </button>
         </div>
      </form>
   );
}
