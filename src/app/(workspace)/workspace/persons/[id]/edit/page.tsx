import { requireAuth } from "@/lib/auth/requireAuth";
import { fetchMe, fetchUserById, fetchPersonProfile } from "@/lib/api/client";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import EditAccountForm from "./EditAccountForm";
import AddExperienceForm from "./AddExperienceForm";
import AddPortfolioForm from "./AddPortfolioForm";
import AddSkillForm from "./AddSkillForm";
import EditPasswordForm from "./EditPasswordForm";
import EditProfileForm from "./EditProfileForm";

export const metadata = { title: "แก้ไขพนักงาน — Vexentra" };

export default async function EditPersonPage({
   params,
}: {
   params: Promise<{ id: string }>;
}) {
   const token = await requireAuth("/workspace/persons");

   const { data: me } = await fetchMe(token);
   if (!me || me.role !== "admin") redirect("/workspace");

   const { id } = await params;

   const { data: user, status } = await fetchUserById(token, id);
   if (!user) {
      if (status === 404) notFound();
      redirect("/workspace/persons");
   }

   const { data: fullProfile } = await fetchPersonProfile(token, user.person_id);
   const profile = fullProfile?.profile ?? null;
   const skills = fullProfile?.skills ?? [];
   const experiences = fullProfile?.experiences ?? [];
   const portfolio = fullProfile?.portfolio ?? [];

   return (
      <div className="ws-page">
         <div className="ws-page-header">
            <div>
               <div style={{ marginBottom: 4 }}>
                  <Link
                     href="/workspace/persons"
                     style={{ fontSize: 13, color: "var(--text-muted)", textDecoration: "none" }}
                  >
                     ← พนักงานทั้งหมด
                  </Link>
               </div>
               <h1 className="ws-page-title">แก้ไขพนักงาน</h1>
               <p className="ws-page-subtitle">
                  {user.username} · {user.email}
               </p>
            </div>
         </div>

         <div style={{ display: "grid", gap: 24, maxWidth: 680 }}>
            <div className="ws-card">
               <h2 className="ws-card-title">โปรไฟล์</h2>
               <EditProfileForm userId={user.id} profile={profile} />
            </div>

            <div className="ws-card">
               <h2 className="ws-card-title">บัญชีผู้ใช้</h2>
               <EditAccountForm user={user} />
            </div>

            <div className="ws-card">
               <h2 className="ws-card-title">รีเซ็ตรหัสผ่าน</h2>
               <EditPasswordForm userId={user.id} />
            </div>

            <div className="ws-card">
               <h2 className="ws-card-title">เพิ่มทักษะ</h2>
               <AddSkillForm userId={user.id} skills={skills} />
            </div>

            <div className="ws-card">
               <h2 className="ws-card-title">เพิ่มประวัติการทำงาน</h2>
               <AddExperienceForm userId={user.id} experiences={experiences} />
            </div>

            <div className="ws-card">
               <h2 className="ws-card-title">เพิ่มผลงาน</h2>
               <AddPortfolioForm userId={user.id} portfolio={portfolio} />
            </div>
         </div>
      </div>
   );
}
