"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
   addMyPortfolioAction,
   deleteMyPortfolioAction,
   updateMyPortfolioAction,
} from "@/app/actions/profile";
import type { PortfolioItem } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean; message?: string };
const init: ActionState = {};

function dateInputValue(iso: string | null): string {
   if (!iso) return "";
   return iso.slice(0, 10);
}

function statusLabel(status: string): string {
   if (status === "published") return "เผยแพร่";
   return "ฉบับร่าง";
}

function PortfolioRow({
   item,
   editingId,
   setEditingId,
}: {
   item: PortfolioItem;
   editingId: string | null;
   setEditingId: (id: string | null) => void;
}) {
   const router = useRouter();
   const editing = editingId === item.id;
   const locked = editingId !== null && editingId !== item.id;

   const [updateError, setUpdateError] = useState<string | undefined>();
   const [deleteError, setDeleteError] = useState<string | undefined>();
   const [updatePending, startUpdate] = useTransition();
   const [deletePending, startDelete] = useTransition();

   const tags = item.tags?.map((t) => t.name).join(", ") || "";

   const updateAction = (formData: FormData) => {
      setUpdateError(undefined);
      startUpdate(async () => {
         const result = await updateMyPortfolioAction(init, formData);
         if (result?.error) {
            setUpdateError(result.error);
            return;
         }
         router.refresh();
         setEditingId(null);
      });
   };

   const deleteAction = (formData: FormData) => {
      setDeleteError(undefined);
      startDelete(async () => {
         const result = await deleteMyPortfolioAction(init, formData);
         if (result?.error) {
            setDeleteError(result.error);
            return;
         }
         router.refresh();
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
            <input type="hidden" name="item_id" value={item.id} />
            {updateError && <div className="ws-form-error">{updateError}</div>}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
               <input name="title" className="ws-form-input" defaultValue={item.title} required />
               <input name="summary" className="ws-form-input" defaultValue={item.summary || ""} />
            </div>

            <textarea
               name="description"
               className="ws-form-input"
               rows={3}
               defaultValue={item.description || ""}
               style={{ resize: "vertical" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
               <input name="demo_url" className="ws-form-input" defaultValue={item.demo_url || ""} placeholder="Demo URL" />
               <input name="source_url" className="ws-form-input" defaultValue={item.source_url || ""} placeholder="Source URL" />
            </div>

            <input
               name="cover_image_url"
               className="ws-form-input"
               defaultValue={item.cover_image_url || ""}
               placeholder="Cover Image URL"
            />

            <input name="tags" className="ws-form-input" defaultValue={tags} placeholder="tags คั่นด้วย comma" />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: 8 }}>
               <select name="status" className="ws-form-select" defaultValue={item.status || "draft"}>
                  <option value="draft">draft</option>
                  <option value="published">published</option>
               </select>
               <input
                  name="sort_order"
                  type="number"
                  className="ws-form-input"
                  defaultValue={item.sort_order ?? 0}
               />
               <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-dim)" }}>
                  <input name="featured" type="checkbox" defaultChecked={item.featured} />
                  Featured
               </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
               <input
                  name="started_at"
                  type="date"
                  className="ws-form-input"
                  defaultValue={dateInputValue(item.started_at ?? null)}
               />
               <input
                  name="ended_at"
                  type="date"
                  className="ws-form-input"
                  defaultValue={dateInputValue(item.ended_at ?? null)}
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
      <div style={{ padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8 }}>
         <div
            style={{
               display: "grid",
               gridTemplateColumns: "minmax(220px, 1fr) 120px auto",
               gap: 10,
               alignItems: "center",
            }}
         >
            <div>
               <div style={{ fontWeight: 600 }}>{item.title}</div>
               {item.summary && (
                  <div style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 2 }}>{item.summary}</div>
               )}
            </div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{statusLabel(item.status)}</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
               <button
                  type="button"
                  className="ws-btn-ghost ws-btn-sm"
                  onClick={() => setEditingId(item.id)}
                  disabled={locked}
               >
                  แก้ไข
               </button>
               <form action={deleteAction}>
                  <input type="hidden" name="item_id" value={item.id} />
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
         {deleteError && <div className="ws-form-error" style={{ marginTop: 8 }}>{deleteError}</div>}
      </div>
   );
}

export default function AddMyPortfolioForm({ portfolio }: { portfolio: PortfolioItem[] }) {
   const router = useRouter();
   const [state, action, pending] = useActionState(addMyPortfolioAction, init);
   const [editingId, setEditingId] = useState<string | null>(null);
   useEffect(() => {
      if (!state.success) return;
      const timer = setTimeout(() => router.refresh(), 1200);
      return () => {
         clearTimeout(timer);
      };
   }, [state.success, router]);

   return (
      <div style={{ display: "grid", gap: 14 }}>
         {editingId === null ? (
            <form action={action}>
               {state.error && <div className="ws-form-error">{state.error}</div>}
               {state.success && (
                  <div className="ws-ephemeral-success" style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>
                     เพิ่มผลงานเรียบร้อย
                  </div>
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
                  <label className="ws-form-label">Cover Image URL</label>
                  <input name="cover_image_url" className="ws-form-input" placeholder="https://..." />
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
               กำลังแก้ไขผลงาน รายการเพิ่มใหม่ถูกซ่อนไว้ชั่วคราว
            </div>
         )}

         <div style={{ borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
               ผลงานที่มีอยู่ ({portfolio.length})
            </div>
            {portfolio.length === 0 ? (
               <div style={{ fontSize: 13, color: "var(--text-dim)" }}>ยังไม่มีข้อมูล</div>
            ) : (
               <div style={{ display: "grid", gap: 8 }}>
                  {portfolio.map((p) => (
                     <PortfolioRow
                        key={p.id}
                        item={p}
                        editingId={editingId}
                        setEditingId={setEditingId}
                     />
                  ))}
               </div>
            )}
         </div>
      </div>
   );
}
