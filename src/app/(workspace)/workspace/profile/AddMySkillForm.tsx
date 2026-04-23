"use client";

import { useActionState } from "react";
import { addMySkillAction } from "@/app/actions/profile";
import type { Skill } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean; message?: string };
const init: ActionState = {};

export default function AddMySkillForm({ skills }: { skills: Skill[] }) {
   const [state, action, pending] = useActionState(addMySkillAction, init);

   return (
      <div style={{ display: "grid", gap: 14 }}>
         <form action={action}>
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
                     <option value="backend">backend</option>
                     <option value="frontend">frontend</option>
                     <option value="devops">devops</option>
                     <option value="other">other</option>
                  </select>
               </div>
               <div className="ws-form-group">
                  <label className="ws-form-label">ระดับ (1-5)</label>
                  <select name="proficiency" className="ws-form-select" defaultValue={3}>
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
               <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {skills.map((s) => (
                     <span key={s.id} className="ws-badge" style={{ background: "var(--bg3)" }}>
                        {s.name} · {s.category} · {s.proficiency}/5
                     </span>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
