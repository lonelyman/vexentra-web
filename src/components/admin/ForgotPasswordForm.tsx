"use client";

import { useActionState, useState } from "react";
import { forgotPasswordAction } from "@/app/actions/auth";

type ActionState = { error?: string; success?: boolean; message?: string } | null;

export default function ForgotPasswordForm() {
   const [state, formAction, pending] = useActionState<ActionState, FormData>(
      forgotPasswordAction,
      null,
   );
   const [email, setEmail] = useState("");

   return (
      <div className="login-card">
         <h2 className="login-title">ลืมรหัสผ่าน</h2>
         <p className="login-subtitle">กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน</p>

         {state?.error && <div className="login-error">{state.error}</div>}
         {state?.success && <div className="login-success">{state.message}</div>}

         <form action={formAction} className="login-form">
            <div className="form-group">
               <label htmlFor="email">Email</label>
               <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
               />
            </div>

            <button type="submit" className="btn-primary login-btn" disabled={pending}>
               {pending ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
            </button>
         </form>
      </div>
   );
}
