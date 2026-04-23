import Link from "next/link";
import ResetPasswordForm from "@/components/admin/ResetPasswordForm";

export default async function ResetPasswordPage({
   searchParams,
}: {
   searchParams: Promise<{ token?: string }>;
}) {
   const params = await searchParams;
   const token = params.token || "";

   return (
      <main className="login-container">
         <div className="login-glow"></div>

         <div className="login-wrapper">
            <Link href="/login" className="back-link">
               &larr; กลับหน้าเข้าสู่ระบบ
            </Link>
            <ResetPasswordForm token={token} />
         </div>
      </main>
   );
}
