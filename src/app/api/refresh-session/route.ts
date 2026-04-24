import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";
const ACCESS_TOKEN_MAX_AGE = 60 * 15;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

function transientRefreshErrorPage(redirectTo: string) {
   const retryURL = `/api/refresh-session?redirect=${encodeURIComponent(redirectTo)}`;
   const html = `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>ระบบกำลังเชื่อมต่อใหม่</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; min-height: 100vh; display: grid; place-items: center; background: #0b1220; color: #e5e7eb; }
    .card { width: min(92vw, 520px); background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 24px; }
    h1 { margin: 0 0 10px; font-size: 20px; }
    p { margin: 0 0 18px; color: #9ca3af; line-height: 1.5; }
    .row { display: flex; gap: 10px; flex-wrap: wrap; }
    a { text-decoration: none; border-radius: 8px; padding: 10px 14px; font-weight: 600; }
    .primary { background: #2563eb; color: #fff; }
    .ghost { border: 1px solid #374151; color: #e5e7eb; }
  </style>
</head>
<body>
  <main class="card">
    <h1>ระบบกำลังเชื่อมต่อใหม่</h1>
    <p>ยังไม่สามารถต่ออายุ session ได้ในตอนนี้ (เช่น API กำลังรีสตาร์ต) ลองใหม่อีกครั้งได้เลย โดยระบบยังไม่ล้างข้อมูลล็อกอินของคุณ</p>
    <div class="row">
      <a class="primary" href="${retryURL}">ลองใหม่</a>
      <a class="ghost" href="${redirectTo}">กลับหน้าก่อนหน้า</a>
    </div>
  </main>
</body>
</html>`;

   return new Response(html, {
      status: 503,
      headers: {
         "Content-Type": "text/html; charset=utf-8",
         "Cache-Control": "no-store",
      },
   });
}

export async function GET(request: NextRequest) {
   const redirectTo =
      request.nextUrl.searchParams.get("redirect") || "/workspace/projects";
   const cookieStore = await cookies();
   const refreshToken = cookieStore.get("refresh_token")?.value;
   const rememberLogin = cookieStore.get("remember_login")?.value === "1";

   if (!refreshToken) {
      redirect("/api/clear-session");
   }

   try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ refresh_token: refreshToken }),
         cache: "no-store",
      });

      if (!res.ok) {
         // Invalid/expired refresh token -> force logout
         if (res.status === 401 || res.status === 403) {
            redirect("/api/clear-session");
         }
         // Transient API/server issue -> keep session cookies, show retry page
         if (res.status >= 500) {
            return transientRefreshErrorPage(redirectTo);
         }
         redirect("/api/clear-session");
      }

      const data = await res.json();
      const baseCookie = {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax" as const,
         path: "/",
      };
      if (rememberLogin) {
         cookieStore.set("token", data.data.access_token, {
            ...baseCookie,
            maxAge: ACCESS_TOKEN_MAX_AGE,
         });
         cookieStore.set("refresh_token", data.data.refresh_token, {
            ...baseCookie,
            maxAge: REFRESH_TOKEN_MAX_AGE,
         });
         cookieStore.set("remember_login", "1", {
            ...baseCookie,
            maxAge: REFRESH_TOKEN_MAX_AGE,
         });
      } else {
         cookieStore.set("token", data.data.access_token, baseCookie);
         cookieStore.set("refresh_token", data.data.refresh_token, baseCookie);
         cookieStore.set("remember_login", "0", baseCookie);
      }
   } catch {
      // Network error / API unreachable (e.g. docker rebuild): do not clear session immediately.
      return transientRefreshErrorPage(redirectTo);
   }

   redirect(redirectTo);
}
