"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";
const ACCESS_TOKEN_MAX_AGE = 60 * 15;
const REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
type LoginActionState = { error?: string } | null;
type ForgotPasswordActionState = { error?: string; success?: boolean; message?: string } | null;
type ResetPasswordActionState = { error?: string; success?: boolean; message?: string } | null;

export async function loginAction(_prevState: LoginActionState, formData: FormData) {
   const email = formData.get("email");
   const password = formData.get("password");
   const rememberLogin = formData.get("remember_login") === "on";

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
   } catch (error) {
      console.error("Login Error:", error);
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่ภายหลัง" };
   }

   // Redirect after setting cookie (must be outside try-catch)
   redirect("/workspace/projects");
}

export async function logoutAction() {
   const cookieStore = await cookies();
   cookieStore.delete("token");
   cookieStore.delete("refresh_token");
   cookieStore.delete("remember_login");
   redirect("/login");
}

export async function forgotPasswordAction(
   _prevState: ForgotPasswordActionState,
   formData: FormData,
) {
   const email = ((formData.get("email") as string) || "").trim();
   if (!email) return { error: "กรุณากรอกอีเมล" };

   try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ email }),
         cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถส่งคำขอรีเซ็ตรหัสผ่านได้" };
      }
      return {
         success: true,
         message:
            data?.data?.message || "หากอีเมลนี้มีในระบบ คุณจะได้รับลิงก์รีเซ็ตรหัสผ่าน",
      };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่ภายหลัง" };
   }
}

export async function resetPasswordAction(
   _prevState: ResetPasswordActionState,
   formData: FormData,
) {
   const token = ((formData.get("token") as string) || "").trim();
   const newPassword = (formData.get("new_password") as string) || "";
   const confirmPassword = (formData.get("confirm_password") as string) || "";

   if (!token) return { error: "ไม่พบ token สำหรับรีเซ็ตรหัสผ่าน" };
   if (!newPassword) return { error: "กรุณากรอกรหัสผ่านใหม่" };
   if (newPassword !== confirmPassword) return { error: "ยืนยันรหัสผ่านไม่ตรงกัน" };
   const strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
   if (!strongPasswordPattern.test(newPassword)) {
      return {
         error:
            "รหัสผ่านต้องมีอย่างน้อย 8 ตัว และต้องมี A-Z, a-z, 0-9 และอักขระพิเศษ",
      };
   }

   try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ token, new_password: newPassword }),
         cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         const detailMessage = Array.isArray(data?.error?.details)
            ? data.error.details.find((d: { message?: string }) => d?.message)?.message
            : "";
         return {
            error:
               detailMessage ||
               data.error?.message ||
               "ไม่สามารถรีเซ็ตรหัสผ่านได้",
         };
      }
      return {
         success: true,
         message: data?.data?.message || "รีเซ็ตรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่",
      };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่ภายหลัง" };
   }
}
