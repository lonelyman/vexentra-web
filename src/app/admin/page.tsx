import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/admin/ProfileForm";
import { FullProfileData } from "@/lib/api/types";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

async function fetchMyProfile(
   token: string,
): Promise<{ data: FullProfileData | null; status: number }> {
   const res = await fetch(`${API_URL}/me/profile`, {
      headers: {
         Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const data = await res.json();
   return { data: data.data, status: res.status };
}

export default async function AdminPage() {
   const token = (await cookies()).get("token")?.value;
   if (!token) redirect("/login");

   const { data: profileData, status } = await fetchMyProfile(token);

   if (!profileData) {
      if (status === 401) {
         // access_token หมดอายุ → ลอง refresh ก่อน
         redirect("/api/refresh-session?redirect=/admin");
      }
      // error อื่น → clear session
      redirect("/api/clear-session");
   }

   return (
      <div className="admin-content">
         <div className="admin-header">
            <h1 className="admin-header-title">ข้อมูลโปรไฟล์</h1>
         </div>
         <ProfileForm initialData={profileData.profile} />
      </div>
   );
}
