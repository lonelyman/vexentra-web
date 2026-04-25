"use client";

import { useRef, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateUserAction } from "@/app/actions/users";
import type { UserListItem, UserRoleMeta, UserStatusMeta } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

const FALLBACK_ROLES: UserRoleMeta[] = [
   { code: "member", label_th: "สมาชิก", label_en: "Member", sort_order: 30, is_active: true },
   { code: "manager", label_th: "ผู้จัดการ", label_en: "Manager", sort_order: 20, is_active: true },
   { code: "admin", label_th: "ผู้ดูแลระบบ", label_en: "Administrator", sort_order: 10, is_active: true },
];

const FALLBACK_STATUSES: UserStatusMeta[] = [
   { code: "pending_verification", label_th: "รอยืนยันอีเมล", label_en: "Pending Verification", sort_order: 10, is_active: true },
   { code: "active", label_th: "ใช้งานได้", label_en: "Active", sort_order: 20, is_active: true },
   { code: "banned", label_th: "ระงับการใช้งาน", label_en: "Banned", sort_order: 30, is_active: true },
];

export default function EditUserModal({
   user,
   roles,
   statuses,
}: {
   user: UserListItem;
   roles?: UserRoleMeta[];
   statuses?: UserStatusMeta[];
}) {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const [state, action, pending] = useActionState(adminUpdateUserAction, init);
   const roleItems = (roles && roles.length > 0 ? roles : FALLBACK_ROLES).filter((r) => r.is_active);
   const statusItems = (statuses && statuses.length > 0 ? statuses : FALLBACK_STATUSES).filter((s) => s.is_active);

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
                        {roleItems.map((r) => (
                           <option key={r.code} value={r.code}>
                              {r.code} — {r.label_th || r.label_en}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div className="ws-form-group">
                     <label className="ws-form-label">สถานะบัญชี</label>
                     <select name="status" className="ws-form-select" defaultValue={user.status}>
                        {statusItems.map((s) => (
                           <option key={s.code} value={s.code}>
                              {s.code} — {s.label_th || s.label_en}
                           </option>
                        ))}
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
