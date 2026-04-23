"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { changeMyPasswordAction } from "@/app/actions/profile";

type ActionState = { error?: string; success?: boolean; message?: string };
const init: ActionState = {};

export default function ForceChangePasswordForm() {
   const router = useRouter();
   const [state, action, pending] = useActionState(changeMyPasswordAction, init);

   useEffect(() => {
      if (state.success) {
         router.replace("/workspace/projects");
      }
   }, [state.success, router]);

   return (
      <form action={action} className="login-form">
         {state.error && <div className="login-error">{state.error}</div>}
         {state.success && (
            <div className="login-success">{state.message || "เปลี่ยนรหัสผ่านเรียบร้อย"}</div>
         )}

         <div className="form-group">
            <label htmlFor="current-password">รหัสผ่านปัจจุบัน</label>
            <input id="current-password" name="current_password" type="password" className="form-input" required />
         </div>

         <div className="form-group">
            <label htmlFor="new-password">รหัสผ่านใหม่</label>
            <input
               id="new-password"
               name="new_password"
               type="password"
               className="form-input"
               placeholder="อย่างน้อย 8 ตัว และควรมีตัวพิมพ์ใหญ่/เล็ก/ตัวเลข/อักขระพิเศษ"
               minLength={8}
               required
            />
         </div>

         <div className="form-group">
            <label htmlFor="re-password">ยืนยันรหัสผ่านใหม่</label>
            <input id="re-password" name="re_password" type="password" className="form-input" minLength={8} required />
         </div>

         <button type="submit" className="btn-primary login-btn" disabled={pending}>
            {pending ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
         </button>
      </form>
   );
}
