"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { resetPasswordAction } from "@/app/actions/auth";

type ActionState = { error?: string; success?: boolean; message?: string } | null;

export default function ResetPasswordForm({ token }: { token: string }) {
   const [state, formAction, pending] = useActionState<ActionState, FormData>(
      resetPasswordAction,
      null,
   );
   const [showPassword, setShowPassword] = useState(false);

   if (!token) {
      return (
         <div className="login-card">
            <h2 className="login-title">รีเซ็ตรหัสผ่าน</h2>
            <div className="login-error">ลิงก์ไม่ถูกต้องหรือไม่มี token</div>
            <div className="login-links">
               <Link href="/forgot-password" className="login-link-inline">
                  ขอรับลิงก์ใหม่
               </Link>
            </div>
         </div>
      );
   }

   return (
      <div className="login-card">
         <h2 className="login-title">ตั้งรหัสผ่านใหม่</h2>
         <p className="login-subtitle">กำหนดรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>
         <p className="login-subtitle" style={{ marginTop: -12, marginBottom: 16, fontSize: 12 }}>
            ต้องมีอย่างน้อย 8 ตัว และมี A-Z, a-z, 0-9, อักขระพิเศษ
         </p>

         {state?.error && <div className="login-error">{state.error}</div>}
         {state?.success && <div className="login-success">{state.message}</div>}

         {!state?.success && (
            <form action={formAction} className="login-form">
               <input type="hidden" name="token" value={token} />

               <div className="form-group">
                  <label htmlFor="new-password">รหัสผ่านใหม่</label>
                  <input
                     id="new-password"
                     name="new_password"
                     type={showPassword ? "text" : "password"}
                     className="form-input"
                     placeholder="อย่างน้อย 8 ตัวอักษร"
                     required
                     minLength={8}
                  />
               </div>

               <div className="form-group">
                  <label htmlFor="confirm-password">ยืนยันรหัสผ่านใหม่</label>
                  <input
                     id="confirm-password"
                     name="confirm_password"
                     type={showPassword ? "text" : "password"}
                     className="form-input"
                     placeholder="กรอกรหัสผ่านอีกครั้ง"
                     required
                     minLength={8}
                  />
               </div>

               <label className="login-remember">
                  <input
                     type="checkbox"
                     onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <span>แสดงรหัสผ่าน</span>
               </label>

               <button type="submit" className="btn-primary login-btn" disabled={pending}>
                  {pending ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
               </button>
            </form>
         )}

         <div className="login-links login-links-spaced">
            <Link href="/login" className="login-link-inline">
               กลับหน้าเข้าสู่ระบบ
            </Link>
         </div>
      </div>
   );
}
