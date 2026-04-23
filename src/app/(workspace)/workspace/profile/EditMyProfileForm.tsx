"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import type { Profile } from "@/lib/api/types";

type ActionState = { error?: string; success?: boolean; message?: string };
const init: ActionState = {};

export default function EditMyProfileForm({ profile }: { profile: Profile | null }) {
   const [state, action, pending] = useActionState(updateProfileAction, init);

   return (
      <form action={action}>
         {state.error && <div className="ws-form-error">{state.error}</div>}
         {state.success && (
            <div style={{ color: "var(--teal)", fontSize: 13, marginBottom: 12 }}>
               {state.message || "บันทึกโปรไฟล์เรียบร้อย"}
            </div>
         )}

         <div className="ws-form-group">
            <label className="ws-form-label">ชื่อแสดงผล</label>
            <input
               name="display_name"
               className="ws-form-input"
               defaultValue={profile?.display_name ?? ""}
               placeholder="ชื่อ-นามสกุล"
               required
               autoComplete="name"
            />
         </div>

         <div className="ws-form-group">
            <label className="ws-form-label">Headline</label>
            <input
               name="headline"
               className="ws-form-input"
               defaultValue={profile?.headline ?? ""}
               placeholder="เช่น Full-Stack Developer"
               required
            />
         </div>

         <div className="ws-form-group">
            <label className="ws-form-label">Bio</label>
            <textarea
               name="bio"
               className="ws-form-textarea"
               rows={4}
               defaultValue={profile?.bio ?? ""}
               placeholder="แนะนำตัวเองสั้น ๆ"
               style={{ resize: "vertical" }}
            />
         </div>

         <div className="ws-form-group">
            <label className="ws-form-label">ที่อยู่ / เมือง</label>
            <input
               name="location"
               className="ws-form-input"
               defaultValue={profile?.location ?? ""}
               placeholder="เช่น Bangkok, Thailand"
            />
         </div>

         <div className="ws-form-group">
            <label className="ws-form-label">URL รูปโปรไฟล์</label>
            <input
               name="avatar_url"
               className="ws-form-input"
               defaultValue={profile?.avatar_url ?? ""}
               placeholder="https://..."
            />
         </div>

         <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button type="submit" className="ws-btn-primary" disabled={pending}>
               {pending ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
            </button>
         </div>
      </form>
   );
}
