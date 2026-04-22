"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

type ActionState = { error?: string; success?: boolean };

export async function adminUpdateUserAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const userId = formData.get("user_id") as string;
   const role = formData.get("role") as string;
   const status = formData.get("status") as string;

   try {
      const res = await fetch(`${API_URL}/users/${userId}`, {
         method: "PATCH",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
         body: JSON.stringify({ role, status }),
         cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถอัปเดตผู้ใช้งานได้" };

      revalidatePath("/workspace/persons");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}
