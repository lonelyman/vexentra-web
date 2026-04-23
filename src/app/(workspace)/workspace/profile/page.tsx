import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import { fetchMe } from "@/lib/api/client";
import type { FullProfileData } from "@/lib/api/types";
import Link from "next/link";
import EditMyProfileForm from "./EditMyProfileForm";
import EditMyPasswordForm from "./EditMyPasswordForm";
import AddMySkillForm from "./AddMySkillForm";
import AddMyExperienceForm from "./AddMyExperienceForm";
import AddMyPortfolioForm from "./AddMyPortfolioForm";
import CopyPortfolioLinkButton from "@/components/workspace/CopyPortfolioLinkButton";

export const metadata = { title: "โปรไฟล์ & Portfolio — Vexentra" };

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

async function fetchMyProfile(token: string): Promise<{ data: FullProfileData | null; status: number }> {
   try {
      const res = await fetch(`${API_URL}/me/profile`, {
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store",
      });
      if (!res.ok) return { data: null, status: res.status };
      const body = await res.json().catch(() => null);
      return { data: body?.data ?? null, status: res.status };
   } catch {
      return { data: null, status: 503 };
   }
}

export default async function ProfilePage() {
   const token = await requireAuth("/workspace/profile");
   const { data: me } = await fetchMe(token);
   if (!me) handleAuthError(401, "/workspace/profile");
   const myPortfolioPath = `/portfolio/${me.person_id}`;

   const { data, status } = await fetchMyProfile(token);
   if (!data && status === 401) handleAuthError(status, "/workspace/profile");

   const profile = data?.profile ?? null;
   const skills = data?.skills ?? [];
   const experiences = data?.experiences ?? [];
   const portfolio = data?.portfolio ?? [];

   return (
      <div className="ws-page">
         <div className="ws-page-header">
            <div>
               <h1 className="ws-page-title">โปรไฟล์ & Portfolio</h1>
               <p className="ws-page-subtitle">
                  แก้ไขข้อมูลของตัวเองที่แสดงในหน้าสาธารณะ
               </p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
               <Link
                  href={myPortfolioPath}
                  className="ws-btn-primary"
                  target="_blank"
                  rel="noreferrer"
               >
                  ดูโปรไฟล์สาธารณะ
               </Link>
               <CopyPortfolioLinkButton path={myPortfolioPath} />
            </div>
         </div>

         <div style={{ display: "grid", gap: 24, maxWidth: 680 }}>
            <div className="ws-card">
               <h2 className="ws-card-title">โปรไฟล์</h2>
               <EditMyProfileForm profile={profile} />
            </div>

            <div className="ws-card">
               <h2 className="ws-card-title">เปลี่ยนรหัสผ่าน</h2>
               <EditMyPasswordForm />
            </div>

            <div className="ws-card">
               <h2 className="ws-card-title">เพิ่มทักษะ</h2>
               <AddMySkillForm skills={skills} />
            </div>

            <div className="ws-card">
               <h2 className="ws-card-title">เพิ่มประวัติการทำงาน</h2>
               <AddMyExperienceForm experiences={experiences} />
            </div>

            <div className="ws-card">
               <h2 className="ws-card-title">เพิ่มผลงาน</h2>
               <AddMyPortfolioForm portfolio={portfolio} />
            </div>
         </div>
      </div>
   );
}
