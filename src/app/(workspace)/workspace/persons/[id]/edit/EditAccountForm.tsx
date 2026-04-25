"use client";

import { useActionState } from "react";
import { adminResendVerifyEmailAction, adminUpdateUserAction } from "@/app/actions/users";
import type { UserMe, UserRoleMeta, UserStatusMeta } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean; message?: string };
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

export default function EditAccountForm({
   user,
   roles,
   statuses,
}: {
   user: UserMe;
   roles?: UserRoleMeta[];
   statuses?: UserStatusMeta[];
}) {
   const [state, action, pending] = useActionState(adminUpdateUserAction, init);
   const [resendState, resendAction, resendPending] = useActionState(adminResendVerifyEmailAction, init);
   const roleItems = (roles && roles.length > 0 ? roles : FALLBACK_ROLES).filter((r) => r.is_active);
   const statusItems = (statuses && statuses.length > 0 ? statuses : FALLBACK_STATUSES).filter((s) => s.is_active);

   return (
      <form action={action}>
         <input type="hidden" name="user_id" value={user.id} />

         {state.error && <div className="ws-form-error">{state.error}</div>}
         {state.success && (
            <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>บันทึกข้อมูลบัญชีเรียบร้อย</div>
         )}
         {resendState.error && <div className="ws-form-error">{resendState.error}</div>}
         {resendState.success && (
            <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>
               {resendState.message || "ส่งอีเมลยืนยันอีกครั้งเรียบร้อย"}
            </div>
         )}

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

         <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
               {!user.is_email_verified && (
                  <button
                     type="submit"
                     formAction={resendAction}
                     className="ws-btn-ghost"
                     disabled={resendPending}
                  >
                     {resendPending ? "กำลังส่ง..." : "ส่งอีเมลยืนยันอีกครั้ง"}
                  </button>
               )}
               <button type="submit" className="ws-btn-primary" disabled={pending}>
                  {pending ? "กำลังบันทึก..." : "บันทึกบัญชี"}
               </button>
            </div>
         </div>
      </form>
   );
}
