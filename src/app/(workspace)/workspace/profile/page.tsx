import ProfileForm from "@/components/admin/ProfileForm";
import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import type { FullProfileData } from "@/lib/api/types";

export const metadata = { title: "โปรไฟล์ & Portfolio — Vexentra" };

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

async function fetchMyProfile(token: string): Promise<{ data: FullProfileData | null; status: number }> {
   const res = await fetch(`${API_URL}/me/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const body = await res.json();
   return { data: body.data, status: res.status };
}

export default async function ProfilePage() {
   const token = await requireAuth("/workspace/profile");
   const { data, status } = await fetchMyProfile(token);
   if (!data) handleAuthError(status, "/workspace/profile");

   return (
      <div className="ws-page">
         <div className="ws-page-header">
            <div>
               <h1 className="ws-page-title">โปรไฟล์ & Portfolio</h1>
               <p className="ws-page-subtitle">แก้ไขข้อมูลโปรไฟล์ที่แสดงในหน้าสาธารณะ</p>
            </div>
         </div>
         <ProfileForm initialData={data!.profile} />
      </div>
   );
}
