"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

export async function loginAction(_prevState: any, formData: FormData) {
   const email = formData.get("email");
   const password = formData.get("password");

   if (!email || !password) {
      return { error: "กรุณากรอกอีเมลและรหัสผ่าน" };
   }

   try {
      const res = await fetch(`${API_URL}/auth/login`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify({ email, password }),
         cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
         return { error: data.error?.message || "เข้าสู่ระบบไม่สำเร็จ" };
      }

      const cookieStore = await cookies();
      cookieStore.set("token", data.data.access_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 15, // 15 minutes — matches API access token expiry
         path: "/",
      });
      cookieStore.set("refresh_token", data.data.refresh_token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7, // 7 days — matches API refresh token expiry
         path: "/",
      });
   } catch (error) {
      console.error("Login Error:", error);
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่ภายหลัง" };
   }

   // Redirect after setting cookie (must be outside try-catch)
   redirect("/admin");
}

export async function logoutAction() {
   const cookieStore = await cookies();
   cookieStore.delete("token");
   cookieStore.delete("refresh_token");
   redirect("/login");
}
