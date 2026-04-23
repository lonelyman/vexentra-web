"use client";

import { useActionState, useState, useTransition } from "react";
import {
   addMyExperienceAction,
   deleteMyExperienceAction,
   updateMyExperienceAction,
} from "@/app/actions/profile";
import type { Experience } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean; message?: string };
const init: ActionState = {};

function dateInputValue(iso: string | null): string {
   if (!iso) return "";
   return iso.slice(0, 10);
}

function yearRange(startedAt: string, endedAt: string | null, isCurrent: boolean): string {
   const startYear = new Date(startedAt).getFullYear();
   if (isCurrent || !endedAt) return `${startYear} - ปัจจุบัน`;
   const endYear = new Date(endedAt).getFullYear();
   return `${startYear} - ${endYear}`;
}

function ExperienceRow({
   exp,
   editingId,
   setEditingId,
}: {
   exp: Experience;
   editingId: string | null;
   setEditingId: (id: string | null) => void;
}) {
   const editing = editingId === exp.id;
   const locked = editingId !== null && editingId !== exp.id;
   const [updateError, setUpdateError] = useState<string | undefined>();
   const [deleteError, setDeleteError] = useState<string | undefined>();
   const [updatePending, startUpdate] = useTransition();
   const [deletePending, startDelete] = useTransition();

   const updateAction = (formData: FormData) => {
      setUpdateError(undefined);
      startUpdate(async () => {
         const result = await updateMyExperienceAction(init, formData);
         if (result?.error) {
            setUpdateError(result.error);
            return;
         }
         setEditingId(null);
      });
   };

   const deleteAction = (formData: FormData) => {
      setDeleteError(undefined);
      startDelete(async () => {
         const result = await deleteMyExperienceAction(init, formData);
         if (result?.error) {
            setDeleteError(result.error);
         }
      });
   };

   if (editing) {
      return (
         <form
            action={updateAction}
            style={{
               padding: "10px",
               border: "1px solid var(--line)",
               borderRadius: 8,
               display: "grid",
               gap: 8,
            }}
         >
            <input type="hidden" name="exp_id" value={exp.id} />
            {updateError && <div className="ws-form-error">{updateError}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
               <input name="company" className="ws-form-input" defaultValue={exp.company} required />
               <input name="position" className="ws-form-input" defaultValue={exp.position} required />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
               <input
                  name="started_at"
                  type="date"
                  className="ws-form-input"
                  defaultValue={dateInputValue(exp.started_at)}
                  required
               />
               <input
                  name="ended_at"
                  type="date"
                  className="ws-form-input"
                  defaultValue={dateInputValue(exp.ended_at)}
               />
            </div>
            <input name="location" className="ws-form-input" defaultValue={exp.location || ""} />
            <textarea
               name="description"
               className="ws-form-input"
               rows={2}
               defaultValue={exp.description || ""}
               style={{ resize: "vertical" }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
               <input id={`is_current_${exp.id}`} name="is_current" type="checkbox" defaultChecked={exp.is_current} />
               <label htmlFor={`is_current_${exp.id}`} style={{ fontSize: 13, color: "var(--text-dim)" }}>
                  ปัจจุบัน
               </label>
               <input
                  name="sort_order"
                  type="number"
                  className="ws-form-input"
                  defaultValue={exp.sort_order}
                  style={{ width: 90, marginLeft: "auto" }}
               />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
               <button type="button" className="ws-btn-ghost ws-btn-sm" onClick={() => setEditingId(null)} disabled={updatePending}>
                  ยกเลิก
               </button>
               <button type="submit" className="ws-btn-primary ws-btn-sm" disabled={updatePending}>
                  {updatePending ? "กำลังบันทึก..." : "บันทึก"}
               </button>
            </div>
         </form>
      );
   }

   return (
      <div style={{ padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8 }}>
         <div
            style={{
               display: "grid",
               gridTemplateColumns: "minmax(180px, 1fr) minmax(180px, 1fr) 140px auto",
               gap: 10,
               alignItems: "center",
            }}
         >
            <div style={{ fontWeight: 600 }}>{exp.position}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{exp.company}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{yearRange(exp.started_at, exp.ended_at, exp.is_current)}</div>
            <div style={{ display: "flex", gap: 6 }}>
               <button type="button" className="ws-btn-ghost ws-btn-sm" onClick={() => setEditingId(exp.id)} disabled={locked}>
                  แก้ไข
               </button>
               <form action={deleteAction}>
                  <input type="hidden" name="exp_id" value={exp.id} />
                  <button
                     type="submit"
                     className="ws-btn-ghost ws-btn-sm"
                     style={{ color: "var(--danger, #ef4444)" }}
                     disabled={deletePending || locked}
                  >
                     {deletePending ? "กำลังลบ..." : "ลบ"}
                  </button>
               </form>
            </div>
         </div>
         {(exp.location || exp.description) && (
            <div style={{ marginTop: 6, fontSize: 12, color: "var(--text-dim)" }}>
               {[exp.location, exp.description].filter(Boolean).join(" · ")}
            </div>
         )}
         {deleteError && <div className="ws-form-error" style={{ marginTop: 8 }}>{deleteError}</div>}
      </div>
   );
}

export default function AddMyExperienceForm({ experiences }: { experiences: Experience[] }) {
   const [state, action, pending] = useActionState(addMyExperienceAction, init);
   const [editingId, setEditingId] = useState<string | null>(null);

   return (
      <div style={{ display: "grid", gap: 14 }}>
         {editingId === null ? (
            <form action={action}>
               {state.error && <div className="ws-form-error">{state.error}</div>}
               {state.success && (
                  <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>
                     เพิ่มประวัติการทำงานเรียบร้อย
                  </div>
               )}

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div className="ws-form-group">
                     <label className="ws-form-label">บริษัท</label>
                     <input name="company" className="ws-form-input" required />
                  </div>
                  <div className="ws-form-group">
                     <label className="ws-form-label">ตำแหน่ง</label>
                     <input name="position" className="ws-form-input" required />
                  </div>
               </div>

               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <div className="ws-form-group">
                     <label className="ws-form-label">เริ่มงาน</label>
                     <input name="started_at" type="date" className="ws-form-input" required />
                  </div>
                  <div className="ws-form-group">
                     <label className="ws-form-label">สิ้นสุด</label>
                     <input name="ended_at" type="date" className="ws-form-input" />
                  </div>
                  <div className="ws-form-group" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                     <input id="is_current" name="is_current" type="checkbox" />
                     <label htmlFor="is_current" className="ws-form-label" style={{ marginBottom: 0 }}>
                        ปัจจุบัน
                     </label>
                  </div>
               </div>

               <div className="ws-form-group">
                  <label className="ws-form-label">สถานที่</label>
                  <input name="location" className="ws-form-input" placeholder="เช่น Bangkok / Remote" />
               </div>

               <div className="ws-form-group">
                  <label className="ws-form-label">รายละเอียด</label>
                  <textarea name="description" className="ws-form-input" rows={3} style={{ resize: "vertical" }} />
               </div>

               <div className="ws-form-group" style={{ maxWidth: 120 }}>
                  <label className="ws-form-label">ลำดับ</label>
                  <input name="sort_order" type="number" className="ws-form-input" defaultValue={0} />
               </div>

               <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="ws-btn-primary" disabled={pending}>
                     {pending ? "กำลังเพิ่ม..." : "เพิ่มประวัติ"}
                  </button>
               </div>
            </form>
         ) : (
            <div
               style={{
                  border: "1px dashed var(--line)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 13,
                  color: "var(--text-dim)",
               }}
            >
               กำลังแก้ไขประวัติการทำงาน รายการเพิ่มใหม่ถูกซ่อนไว้ชั่วคราว
            </div>
         )}

         <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
               ประวัติการทำงานที่มีอยู่ ({experiences.length})
            </div>
            {experiences.length === 0 ? (
               <div style={{ fontSize: 13, color: "var(--text-dim)" }}>ยังไม่มีข้อมูล</div>
            ) : (
               <div style={{ display: "grid", gap: 8 }}>
                  <div
                     style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(180px, 1fr) minmax(180px, 1fr) 140px auto",
                        gap: 10,
                        fontSize: 12,
                        color: "var(--text-muted)",
                        padding: "0 10px",
                     }}
                  >
                     <div>ตำแหน่ง</div>
                     <div>บริษัท</div>
                     <div>ปี</div>
                     <div style={{ textAlign: "right" }}>จัดการ</div>
                  </div>
                  {experiences.map((e) => (
                     <ExperienceRow key={e.id} exp={e} editingId={editingId} setEditingId={setEditingId} />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
