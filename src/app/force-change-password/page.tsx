import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireAuth, handleAuthError } from "@/lib/auth/requireAuth";
import { fetchMe } from "@/lib/api/client";
import ForceChangePasswordForm from "@/components/admin/ForceChangePasswordForm";
import "@/styles/login.css";

export const metadata = { title: "บังคับเปลี่ยนรหัสผ่าน — Vexentra" };

export default async function ForceChangePasswordPage() {
   const token = await requireAuth("/force-change-password");
   const forcePasswordChange = (await cookies()).get("force_password_change")?.value === "1";
   if (!forcePasswordChange) {
      redirect("/workspace/projects");
   }

   const { data: me, status } = await fetchMe(token);
   if (!me) handleAuthError(status, "/force-change-password");

   return (
      <main className="login-container">
         <div className="login-glow"></div>
         <div className="login-wrapper">
            <div className="login-card">
               <h2 className="login-title">เปลี่ยนรหัสผ่านก่อนใช้งาน</h2>
               <p className="login-subtitle">บัญชีของคุณใช้รหัสผ่านที่ผู้ดูแลระบบตั้งให้ กรุณาเปลี่ยนรหัสผ่านใหม่เพื่อความปลอดภัย</p>
               <p className="login-subtitle" style={{ marginTop: -10, marginBottom: 18 }}>
                  {me.email}
               </p>
               <ForceChangePasswordForm />
            </div>
         </div>
      </main>
   );
}
