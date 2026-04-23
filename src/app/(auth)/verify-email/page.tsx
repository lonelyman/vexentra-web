import Link from "next/link";

const API_URL =
   process.env.INTERNAL_API_URL ||
   process.env.NEXT_PUBLIC_API_URL ||
   "http://localhost:3000/api/v1";

async function verifyEmail(token: string): Promise<{ ok: boolean; message: string }> {
   if (!token) {
      return { ok: false, message: "ไม่พบ token สำหรับยืนยันอีเมล" };
   }

   try {
      const res = await fetch(
         `${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`,
         { method: "GET", cache: "no-store" },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return {
            ok: false,
            message: data?.error?.message || "ไม่สามารถยืนยันอีเมลได้",
         };
      }
      return {
         ok: true,
         message: data?.data?.message || "ยืนยันอีเมลสำเร็จ",
      };
   } catch {
      return { ok: false, message: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

export default async function VerifyEmailPage({
   searchParams,
}: {
   searchParams: Promise<{ token?: string }>;
}) {
   const params = await searchParams;
   const result = await verifyEmail(params.token || "");

   return (
      <main className="login-container">
         <div className="login-glow"></div>

         <div className="login-wrapper">
            <div className="login-card">
               <h2 className="login-title">ยืนยันอีเมล</h2>
               {result.ok ? (
                  <div className="login-success">{result.message}</div>
               ) : (
                  <div className="login-error">{result.message}</div>
               )}

               <div className="login-links login-links-spaced" style={{ justifyContent: "center" }}>
                  <Link href="/login" className="login-link-inline">
                     ไปหน้าเข้าสู่ระบบ
                  </Link>
               </div>
            </div>
         </div>
      </main>
   );
}
