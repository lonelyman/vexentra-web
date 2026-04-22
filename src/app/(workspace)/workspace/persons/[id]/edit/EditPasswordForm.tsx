"use client";

import { useActionState } from "react";
import { adminSetUserPasswordAction } from "@/app/actions/users";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

export default function EditPasswordForm({ userId }: { userId: string }) {
   const [state, action, pending] = useActionState(adminSetUserPasswordAction, init);

   return (
      <form action={action}>
         <input type="hidden" name="user_id" value={userId} />

         {state.error && <div className="ws-form-error">{state.error}</div>}
         {state.success && (
            <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>เปลี่ยนรหัสผ่านเรียบร้อย</div>
         )}

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
