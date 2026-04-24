"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { adminUpdateProfileAction } from "@/app/actions/users";
import type { Profile } from "@/lib/api/types";
import FileDropzoneField from "@/components/forms/FileDropzoneField";

type ActionState = { error?: string; success?: boolean; message?: string };
const init: ActionState = {};

export default function EditProfileForm({
   userId,
   personId,
   profile,
}: {
   userId: string;
   personId: string;
   profile: Profile | null;
}) {
   const [state, action, pending] = useActionState(adminUpdateProfileAction, init);
   const router = useRouter();
   const [dropzoneResetSignal, setDropzoneResetSignal] = useState(0);
   const showDeleteSuccess = Boolean(
      state.success && (state.message || "").includes("ลบรูปโปรไฟล์"),
   );

   useEffect(() => {
      if (pending || !state.success) return;
      setDropzoneResetSignal((v) => v + 1);
      router.refresh();
   }, [pending, state.success, state.message, router]);

   return (
      <form action={action}>
         <input type="hidden" name="user_id" value={userId} />
         <input type="hidden" name="person_id" value={personId} />
         <input type="hidden" name="avatar_file_id" value={profile?.avatar_file_id ?? ""} />

         {state.error && <div className="ws-form-error">{state.error}</div>}
         {showDeleteSuccess && (
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
            <label className="ws-form-label ws-form-label--optional">รูปโปรไฟล์</label>
            <FileDropzoneField
               name="avatar_file"
               accept="image/jpeg,image/png,image/webp"
               hint="รองรับ JPEG / PNG / WEBP (สูงสุด 5MB)"
               currentImageUrl={profile?.avatar_url ?? null}
               currentImageAlt={profile?.display_name || "avatar"}
               resetSignal={dropzoneResetSignal}
            />
         </div>

         <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button type="submit" className="ws-btn-primary" disabled={pending}>
               {pending ? "กำลังบันทึก..." : "บันทึกโปรไฟล์"}
            </button>
         </div>
      </form>
   );
}
