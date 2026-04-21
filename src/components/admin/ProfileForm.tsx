"use client";

import { useActionState, useEffect, useState } from "react";
import { updateProfileAction } from "@/app/actions/profile";
import { Profile } from "@/lib/api/types";

export default function ProfileForm({
   initialData,
}: {
   initialData: Profile | null | undefined;
}) {
   const [state, formAction, pending] = useActionState(
      updateProfileAction,
      null,
   );
   const [showSuccess, setShowSuccess] = useState(false);

   useEffect(() => {
      if (state?.success) {
         setShowSuccess(true);
         const timer = setTimeout(() => setShowSuccess(false), 3000);
         return () => clearTimeout(timer);
      }
   }, [state]);

   return (
      <div className="admin-card">
         <h2 className="admin-card-title">แก้ไขข้อมูลโปรไฟล์ (Profile)</h2>

         {state?.error && (
            <div className="toast-message toast-error">
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{ width: "20px" }}
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
               </svg>
               {state.error}
            </div>
         )}

         {showSuccess && (
            <div className="toast-message toast-success">
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{ width: "20px" }}
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
               </svg>
               {state.message}
            </div>
         )}

         <form action={formAction}>
            <div className="admin-form-row">
               <div className="form-group">
                  <label htmlFor="display_name">
                     ชื่อที่แสดง (Display Name)
                  </label>
                  <input
                     type="text"
                     id="display_name"
                     name="display_name"
                     defaultValue={initialData?.display_name || ""}
                     required
                     className="form-input"
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="avatar_url">
                     ไอคอน / รูปภาพ (Avatar URL)
                  </label>
                  <input
                     type="text"
                     id="avatar_url"
                     name="avatar_url"
                     defaultValue={initialData?.avatar_url || ""}
                     className="form-input"
                  />
               </div>
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
               <label htmlFor="headline">
                  ตำแหน่ง / คำบรรยายสั้น (Headline)
               </label>
               <input
                  type="text"
                  id="headline"
                  name="headline"
                  defaultValue={initialData?.headline || ""}
                  required
                  className="form-input"
               />
            </div>

            <div className="form-group" style={{ marginBottom: "20px" }}>
               <label htmlFor="location">สถานที่ (Location)</label>
               <input
                  type="text"
                  id="location"
                  name="location"
                  defaultValue={initialData?.location || ""}
                  className="form-input"
               />
            </div>

            <div className="form-group" style={{ marginBottom: "30px" }}>
               <label htmlFor="bio">ประวัติโดยย่อ (Bio)</label>
               <textarea
                  id="bio"
                  name="bio"
                  defaultValue={initialData?.bio || ""}
                  className="form-textarea"
                  required
               ></textarea>
            </div>

            <button
               type="submit"
               className="btn-primary"
               disabled={pending}
               style={{ padding: "12px 30px" }}
            >
               {pending ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
         </form>
      </div>
   );
}
