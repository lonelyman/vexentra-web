import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import Link from "next/link";

export default async function LoginPage() {
   const cookieStore = await cookies();
   const token = cookieStore.get("token")?.value;
   const forcePasswordChange = cookieStore.get("force_password_change")?.value === "1";
   if (token && forcePasswordChange) redirect("/force-change-password");
   if (token) redirect("/workspace/projects");

   return (
      <main className="login-container">
         <div className="login-glow"></div>

         <div className="login-wrapper">
            <Link href="/" className="back-link">
               &larr; กลับหน้าหลัก
            </Link>
            <LoginForm />
         </div>
      </main>
   );
}
