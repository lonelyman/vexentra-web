"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import type { Skill } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean; message?: string };
const init: ActionState = {};

type SkillAction = (
   _prev: ActionState,
   formData: FormData,
) => Promise<ActionState>;

const categoryOptions = [
   { value: "backend", label: "Backend & API" },
   { value: "frontend", label: "Frontend" },
   { value: "devops", label: "DevOps & Tools" },
   { value: "other", label: "Other" },
];

function HiddenFields({ fields }: { fields?: Record<string, string> }) {
   if (!fields) return null;
   return (
      <>
         {Object.entries(fields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
         ))}
      </>
   );
}

function SkillRow({
   skill,
   editingId,
   setEditingId,
   updateActionFn,
   deleteActionFn,
   hiddenFields,
}: {
   skill: Skill;
   editingId: string | null;
   setEditingId: (id: string | null) => void;
   updateActionFn: SkillAction;
   deleteActionFn: SkillAction;
   hiddenFields?: Record<string, string>;
}) {
   const editing = editingId === skill.id;
   const locked = editingId !== null && editingId !== skill.id;
   const [updateError, setUpdateError] = useState<string | undefined>();
   const [deleteError, setDeleteError] = useState<string | undefined>();
   const [updatePending, startUpdate] = useTransition();
   const [deletePending, startDelete] = useTransition();

   const updateAction = (formData: FormData) => {
      setUpdateError(undefined);
      startUpdate(async () => {
         const result = await updateActionFn(init, formData);
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
         const result = await deleteActionFn(init, formData);
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
            <HiddenFields fields={hiddenFields} />
            <input type="hidden" name="skill_id" value={skill.id} />
            {updateError && <div className="ws-form-error">{updateError}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 90px 90px", gap: 8 }}>
               <input name="name" className="ws-form-input" defaultValue={skill.name} required />
               <select name="category" className="ws-form-select" defaultValue={skill.category}>
                  {categoryOptions.map((o) => (
                     <option key={o.value} value={o.value}>
                        {o.label}
                     </option>
                  ))}
               </select>
               <select
                  name="proficiency"
                  className="ws-form-select"
                  defaultValue={skill.proficiency}
               >
                  {[1, 2, 3, 4, 5].map((v) => (
                     <option key={v} value={v}>
                        {v}
                     </option>
                  ))}
               </select>
               <input
                  name="sort_order"
                  type="number"
                  className="ws-form-input"
                  defaultValue={skill.sort_order}
               />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
               <button
                  type="button"
                  className="ws-btn-ghost ws-btn-sm"
                  onClick={() => setEditingId(null)}
                  disabled={updatePending}
               >
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
      <div
         style={{
            padding: "8px 10px",
            border: "1px solid var(--line)",
            borderRadius: 8,
            display: "grid",
            gap: 6,
         }}
      >
         <div
            style={{
               display: "grid",
               gridTemplateColumns: "minmax(180px, 1fr) 170px 80px auto",
               gap: 10,
               alignItems: "center",
            }}
         >
            <div style={{ fontWeight: 600 }}>{skill.name}</div>
            <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{skill.category}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{skill.proficiency}/5</div>
            <div style={{ display: "flex", gap: 6 }}>
               <button
                  type="button"
                  className="ws-btn-ghost ws-btn-sm"
                  onClick={() => setEditingId(skill.id)}
                  disabled={locked}
               >
                  แก้ไข
               </button>
               <form action={deleteAction}>
                  <HiddenFields fields={hiddenFields} />
                  <input type="hidden" name="skill_id" value={skill.id} />
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
         {deleteError && <div className="ws-form-error">{deleteError}</div>}
      </div>
   );
}

export default function SkillManagerForm({
   skills,
   addActionFn,
   updateActionFn,
   deleteActionFn,
   hiddenFields,
}: {
   skills: Skill[];
   addActionFn: SkillAction;
   updateActionFn: SkillAction;
   deleteActionFn: SkillAction;
   hiddenFields?: Record<string, string>;
}) {
   const [state, action, pending] = useActionState(addActionFn, init);
   const [editingId, setEditingId] = useState<string | null>(null);
   const addFormRef = useRef<HTMLFormElement>(null);

   useEffect(() => {
      if (state.success && editingId === null) {
         addFormRef.current?.reset();
      }
   }, [state.success, editingId]);

   return (
      <div style={{ display: "grid", gap: 14 }}>
         {editingId === null ? (
            <form action={action} ref={addFormRef}>
               <HiddenFields fields={hiddenFields} />
               {state.error && <div className="ws-form-error">{state.error}</div>}
               {state.success && (
                  <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>
                     เพิ่มทักษะเรียบร้อย
                  </div>
               )}

               <div className="ws-form-group">
                  <label className="ws-form-label">ชื่อทักษะ</label>
                  <input
                     name="name"
                     className="ws-form-input"
                     placeholder="เช่น Go, React, Docker"
                     required
                  />
               </div>
               <div
                  style={{
                     display: "grid",
                     gridTemplateColumns: "1fr 1fr 100px",
                     gap: 10,
                  }}
               >
                  <div className="ws-form-group">
                     <label className="ws-form-label">หมวดหมู่</label>
                     <select name="category" className="ws-form-select" defaultValue="other">
                        {categoryOptions.map((o) => (
                           <option key={o.value} value={o.value}>
                              {o.label}
                           </option>
                        ))}
                     </select>
                  </div>
                  <div className="ws-form-group">
                     <label className="ws-form-label">ระดับ (1-5)</label>
                     <select name="proficiency" className="ws-form-select" defaultValue="" required>
                        <option value="" disabled>
                           เลือกระดับ
                        </option>
                        {[1, 2, 3, 4, 5].map((v) => (
                           <option key={v} value={v}>
                              {v}
                           </option>
                        ))}
                     </select>
                  </div>
                  <div className="ws-form-group">
                     <label className="ws-form-label">ลำดับ</label>
                     <input
                        name="sort_order"
                        type="number"
                        className="ws-form-input"
                        defaultValue={0}
                     />
                  </div>
               </div>
               <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button type="submit" className="ws-btn-primary" disabled={pending}>
                     {pending ? "กำลังเพิ่ม..." : "เพิ่มทักษะ"}
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
               กำลังแก้ไขทักษะ รายการเพิ่มใหม่ถูกซ่อนไว้ชั่วคราว
            </div>
         )}

         <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <div
               style={{
                  fontSize: 13,
                  color: "var(--text-muted)",
                  marginBottom: 8,
               }}
            >
               ทักษะที่มีอยู่ ({skills.length})
            </div>
            {skills.length === 0 ? (
               <div style={{ fontSize: 13, color: "var(--text-dim)" }}>ยังไม่มีข้อมูล</div>
            ) : (
               <div style={{ display: "grid", gap: 8 }}>
                  {skills.map((s) => (
                     <SkillRow
                        key={s.id}
                        skill={s}
                        editingId={editingId}
                        setEditingId={setEditingId}
                        updateActionFn={updateActionFn}
                        deleteActionFn={deleteActionFn}
                        hiddenFields={hiddenFields}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
