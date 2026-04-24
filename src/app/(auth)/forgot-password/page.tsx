import Link from "next/link";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";

export default function ForgotPasswordPage() {
   return (
      <main className="login-container">
         <div className="login-glow"></div>

         <div className="login-wrapper">
            <Link href="/login" className="back-link">
               &larr; กลับหน้าเข้าสู่ระบบ
            </Link>
            <ForgotPasswordForm />
         </div>
      </main>
   );
}
