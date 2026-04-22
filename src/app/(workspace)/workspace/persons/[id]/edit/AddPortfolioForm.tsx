"use client";

import { useActionState } from "react";
import { adminAddPortfolioAction } from "@/app/actions/users";
import type { PortfolioItem } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

export default function AddPortfolioForm({
   userId,
   portfolio,
}: {
   userId: string;
   portfolio: PortfolioItem[];
}) {
   const [state, action, pending] = useActionState(adminAddPortfolioAction, init);

   return (
      <div style={{ display: "grid", gap: 14 }}>
         <form action={action}>
            <input type="hidden" name="user_id" value={userId} />
            {state.error && <div className="ws-form-error">{state.error}</div>}
            {state.success && (
               <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>เพิ่มผลงานเรียบร้อย</div>
            )}

            <div className="ws-form-group">
               <label className="ws-form-label">ชื่อผลงาน</label>
               <input name="title" className="ws-form-input" required />
            </div>
            <div className="ws-form-group">
               <label className="ws-form-label">สรุปสั้น</label>
               <input name="summary" className="ws-form-input" />
            </div>
            <div className="ws-form-group">
               <label className="ws-form-label">รายละเอียด</label>
               <textarea name="description" className="ws-form-input" rows={3} style={{ resize: "vertical" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
               <div className="ws-form-group">
                  <label className="ws-form-label">Demo URL</label>
                  <input name="demo_url" className="ws-form-input" placeholder="https://..." />
               </div>
               <div className="ws-form-group">
                  <label className="ws-form-label">Source URL</label>
                  <input name="source_url" className="ws-form-input" placeholder="https://..." />
               </div>
            </div>

            <div className="ws-form-group">
               <label className="ws-form-label">Tags (คั่นด้วย comma)</label>
               <input name="tags" className="ws-form-input" placeholder="go, fiber, postgres" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
               <div className="ws-form-group">
                  <label className="ws-form-label">สถานะ</label>
                  <select name="status" className="ws-form-select" defaultValue="draft">
                     <option value="draft">draft</option>
                     <option value="published">published</option>
                  </select>
               </div>
               <div className="ws-form-group">
                  <label className="ws-form-label">ลำดับ</label>
                  <input name="sort_order" type="number" className="ws-form-input" defaultValue={0} />
               </div>
               <div className="ws-form-group" style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <input id="featured" name="featured" type="checkbox" />
                  <label htmlFor="featured" className="ws-form-label" style={{ marginBottom: 0 }}>
                     Featured
                  </label>
               </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
               <div className="ws-form-group">
                  <label className="ws-form-label">เริ่มต้น</label>
                  <input name="started_at" type="date" className="ws-form-input" />
               </div>
               <div className="ws-form-group">
                  <label className="ws-form-label">สิ้นสุด</label>
                  <input name="ended_at" type="date" className="ws-form-input" />
               </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
               <button type="submit" className="ws-btn-primary" disabled={pending}>
                  {pending ? "กำลังเพิ่ม..." : "เพิ่มผลงาน"}
               </button>
            </div>
         </form>

         <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>ผลงานที่มีอยู่ ({portfolio.length})</div>
            {portfolio.length === 0 ? (
               <div style={{ fontSize: 13, color: "var(--text-dim)" }}>ยังไม่มีข้อมูล</div>
            ) : (
               <div style={{ display: "grid", gap: 8 }}>
                  {portfolio.map((p) => (
                     <div key={p.id} style={{ padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8 }}>
                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                        <div style={{ fontSize: 13, color: "var(--text-dim)" }}>{p.status}</div>
                     </div>
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
