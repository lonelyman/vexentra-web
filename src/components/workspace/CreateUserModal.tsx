"use client";

import { useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminCreateUserAction } from "@/app/actions/users";
import type { UserRoleMeta } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

const FALLBACK_ROLES: UserRoleMeta[] = [
   { code: "member", label_th: "สมาชิก", label_en: "Member", sort_order: 30, is_active: true },
   { code: "manager", label_th: "ผู้จัดการ", label_en: "Manager", sort_order: 20, is_active: true },
   { code: "admin", label_th: "ผู้ดูแลระบบ", label_en: "Administrator", sort_order: 10, is_active: true },
];

export default function CreateUserModal({ roles }: { roles?: UserRoleMeta[] }) {
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

   const roleItems = (roles && roles.length > 0 ? roles : FALLBACK_ROLES).filter((r) => r.is_active);

   return (
      <>
         <button className="ws-btn-primary" onClick={open}>
            + เพิ่มพนักงาน
         </button>

         <div ref={backdropRef} className="ws-dialog-backdrop">
            <div className="ws-dialog">
               <div className="ws-dialog-title">เพิ่มพนักงานใหม่</div>
               <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                  ระบบจะส่งอีเมลยืนยันบัญชีให้สมาชิก และผู้ใช้จะเข้าใช้งานได้หลังยืนยันอีเมลแล้วเท่านั้น
               </p>

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
                        {roleItems.map((r) => (
                           <option key={r.code} value={r.code}>
                              {r.code} — {r.label_th || r.label_en}
                           </option>
                        ))}
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
