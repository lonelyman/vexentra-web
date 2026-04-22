"use client";

import { useActionState } from "react";
import { adminUpdateUserAction } from "@/app/actions/users";
import type { UserMe } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

export default function EditAccountForm({ user }: { user: UserMe }) {
   const [state, action, pending] = useActionState(adminUpdateUserAction, init);

   return (
      <form action={action}>
         <input type="hidden" name="user_id" value={user.id} />

         {state.error && <div className="ws-form-error">{state.error}</div>}
         {state.success && (
            <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>บันทึกข้อมูลบัญชีเรียบร้อย</div>
         )}

         <div className="ws-form-group">
            <label className="ws-form-label">Role</label>
            <select name="role" className="ws-form-select" defaultValue={user.role}>
               <option value="member">member — ผู้ใช้ทั่วไป</option>
               <option value="manager">manager — หัวหน้าทีม</option>
               <option value="admin">admin — เจ้าของระบบ</option>
            </select>
         </div>

         <div className="ws-form-group">
            <label className="ws-form-label">สถานะบัญชี</label>
            <select name="status" className="ws-form-select" defaultValue={user.status}>
               <option value="active">active — ใช้งานได้ปกติ</option>
               <option value="banned">banned — ระงับการใช้งาน</option>
               <option value="pending_verification">pending_verification — รอยืนยันอีเมล</option>
            </select>
         </div>

         <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button type="submit" className="ws-btn-primary" disabled={pending}>
               {pending ? "กำลังบันทึก..." : "บันทึกบัญชี"}
            </button>
         </div>
      </form>
   );
}
