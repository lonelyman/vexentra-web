"use client";

import { useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminCreateUserAction } from "@/app/actions/users";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

export default function CreateUserModal() {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const formRef = useRef<HTMLFormElement>(null);
   const [state, action, pending] = useActionState(adminCreateUserAction, init);

   useEffect(() => {
      if (state.success) {
         backdropRef.current?.classList.remove("open");
         formRef.current?.reset();
         router.refresh();
      }
   }, [state.success, router]);

   const open = () => backdropRef.current?.classList.add("open");
   const close = () => backdropRef.current?.classList.remove("open");

   return (
      <>
         <button className="ws-btn-primary" onClick={open}>
            + เพิ่มพนักงาน
         </button>

         <div ref={backdropRef} className="ws-dialog-backdrop">
            <div className="ws-dialog">
               <div className="ws-dialog-title">เพิ่มพนักงานใหม่</div>

               {state.error && <div className="ws-form-error">{state.error}</div>}

               <form ref={formRef} action={action}>
                  <div className="ws-form-group">
                     <label className="ws-form-label">ชื่อ-นามสกุล (แสดงผล)</label>
                     <input
                        name="display_name"
                        className="ws-form-input"
                        placeholder="เช่น สมชาย ใจดี"
                        required
                     />
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">อีเมล</label>
                     <input
                        name="email"
                        type="email"
                        className="ws-form-input"
                        placeholder="employee@example.com"
                        required
                     />
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">รหัสผ่านเริ่มต้น</label>
                     <input
                        name="password"
                        type="password"
                        className="ws-form-input"
                        placeholder="อย่างน้อย 8 ตัวอักษร"
                        minLength={8}
                        required
                     />
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">Role</label>
                     <select name="role" className="ws-form-select" defaultValue="member">
                        <option value="member">member — ผู้ใช้ทั่วไป</option>
                        <option value="manager">manager — หัวหน้าทีม</option>
                        <option value="admin">admin — เจ้าของระบบ</option>
                     </select>
                  </div>

                  <div className="ws-dialog-actions">
                     <button type="button" className="ws-btn-ghost" onClick={close}>
                        ยกเลิก
                     </button>
                     <button type="submit" className="ws-btn-primary" disabled={pending}>
                        {pending ? "กำลังสร้าง..." : "สร้างบัญชี"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
