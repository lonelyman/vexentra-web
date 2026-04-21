import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import Link from "next/link";

export default async function LoginPage() {
   const token = (await cookies()).get("token")?.value;
   if (token) redirect("/admin");

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
