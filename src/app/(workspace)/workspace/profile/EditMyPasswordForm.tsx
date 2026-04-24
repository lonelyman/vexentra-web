"use client";

import { useActionState } from "react";
import { changeMyPasswordAction } from "@/app/actions/profile";

type ActionState = { error?: string; success?: boolean; message?: string };
const init: ActionState = {};

export default function EditMyPasswordForm() {
   const [state, action, pending] = useActionState(changeMyPasswordAction, init);

   return (
      <form action={action}>
         {state.error && <div className="ws-form-error">{state.error}</div>}
         {state.success && (
            <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>
               {state.message || "เปลี่ยนรหัสผ่านเรียบร้อย"}
            </div>
         )}

         <div className="ws-form-group">
            <label className="ws-form-label">รหัสผ่านปัจจุบัน</label>
            <input
               type="password"
               name="current_password"
               className="ws-form-input"
               required
            />
         </div>

         <div className="ws-form-group">
            <label className="ws-form-label">รหัสผ่านใหม่</label>
            <input
               type="password"
               name="new_password"
               className="ws-form-input"
               placeholder="อย่างน้อย 8 ตัว และควรมีตัวพิมพ์ใหญ่/เล็ก/ตัวเลข/อักขระพิเศษ"
               minLength={8}
               required
            />
         </div>

         <div className="ws-form-group">
            <label className="ws-form-label">ยืนยันรหัสผ่านใหม่</label>
            <input
               type="password"
               name="re_password"
               className="ws-form-input"
               minLength={8}
               required
            />
         </div>

         <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button type="submit" className="ws-btn-primary" disabled={pending}>
               {pending ? "กำลังเปลี่ยน..." : "เปลี่ยนรหัสผ่าน"}
            </button>
         </div>
      </form>
   );
}
