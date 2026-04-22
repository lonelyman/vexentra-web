"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

type ActionState = { error?: string; success?: boolean };

export async function createProjectAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const name = (formData.get("name") as string)?.trim();
   const description = (formData.get("description") as string)?.trim();

   if (!name) return { error: "กรุณาระบุชื่อโปรเจกต์" };

   try {
      const res = await fetch(`${API_URL}/projects`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
            name,
            description: description || undefined,
         }),
         cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถสร้างโปรเจกต์ได้" };
      }

      revalidatePath("/workspace/projects");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}
