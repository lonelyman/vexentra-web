"use client";

import { useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateUserAction } from "@/app/actions/users";
import type { UserListItem } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

export default function EditUserModal({ user }: { user: UserListItem }) {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const [state, action, pending] = useActionState(adminUpdateUserAction, init);

   useEffect(() => {
      if (state.success) {
         backdropRef.current?.classList.remove("open");
         router.refresh();
      }
   }, [state.success, router]);

   const open = () => backdropRef.current?.classList.add("open");
   const close = () => backdropRef.current?.classList.remove("open");

   return (
      <>
         <button className="ws-btn-ghost ws-btn-sm" onClick={open}>
            แก้ไข
         </button>

         <div ref={backdropRef} className="ws-dialog-backdrop">
            <div className="ws-dialog">
               <div className="ws-dialog-title">แก้ไขผู้ใช้งาน</div>
               <p style={{ fontSize: 13, color: "var(--text-dim)", marginBottom: 20 }}>
                  {user.username} · {user.email}
               </p>

               {state.error && <div className="ws-form-error">{state.error}</div>}

               <form action={action}>
                  <input type="hidden" name="user_id" value={user.id} />

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

                  <div className="ws-dialog-actions">
                     <button type="button" className="ws-btn-ghost" onClick={close}>
                        ยกเลิก
                     </button>
                     <button type="submit" className="ws-btn-primary" disabled={pending}>
                        {pending ? "กำลังบันทึก..." : "บันทึก"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
