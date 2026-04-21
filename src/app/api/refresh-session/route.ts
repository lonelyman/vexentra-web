import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

export async function GET(request: NextRequest) {
   const redirectTo = request.nextUrl.searchParams.get("redirect") || "/admin";
   const cookieStore = await cookies();
   const refreshToken = cookieStore.get("refresh_token")?.value;

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
         // refresh_token หมดอายุหรือไม่ valid → logout
         redirect("/api/clear-session");
      }

      const data = await res.json();
      cookieStore.set("token", data.data.access_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 15, // 15 minutes
         path: "/",
      });
      cookieStore.set("refresh_token", data.data.refresh_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7, // 7 days
         path: "/",
      });
   } catch {
      redirect("/api/clear-session");
   }

   redirect(redirectTo);
}
