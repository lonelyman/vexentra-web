"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

type ActionState = { error?: string; success?: boolean };

export async function createTransactionAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const projectId = formData.get("project_id") as string;
   const categoryId = (formData.get("category_id") as string)?.trim();
   const amount = (formData.get("amount") as string)?.trim();
   const note = (formData.get("note") as string)?.trim();
   const occurredAt = (formData.get("occurred_at") as string)?.trim();

   if (!projectId || !categoryId || !amount || !occurredAt) {
      return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
   }

   try {
      const res = await fetch(`${API_URL}/projects/${projectId}/transactions`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
            category_id: categoryId,
            amount,
            note: note || undefined,
            occurred_at: occurredAt,
         }),
         cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถบันทึกรายการได้" };
      }

      revalidatePath(`/workspace/projects`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

export async function deleteTransactionAction(
   projectId: string,
   txId: string,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   try {
      const res = await fetch(
         `${API_URL}/projects/${projectId}/transactions/${txId}`,
         {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
         },
      );

      if (!res.ok && res.status !== 204) {
         const data = await res.json().catch(() => ({}));
         return { error: data.error?.message || "ไม่สามารถลบรายการได้" };
      }

      revalidatePath(`/workspace/projects`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}
