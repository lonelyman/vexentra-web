"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

type ActionState = { error?: string; success?: boolean };

function normalizeOccurredAt(occurredAt: string): string | null {
   if (/^\d{4}-\d{2}-\d{2}$/.test(occurredAt)) {
      return `${occurredAt}T00:00:00.000Z`;
   }
   const parsed = new Date(occurredAt);
   if (Number.isNaN(parsed.getTime())) return null;
   return parsed.toISOString();
}

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

   const occurredAtISO = normalizeOccurredAt(occurredAt);
   if (!occurredAtISO) return { error: "วันที่รายการไม่ถูกต้อง" };

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
            occurred_at: occurredAtISO,
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

export async function updateTransactionAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const projectId = (formData.get("project_id") as string)?.trim();
   const txId = (formData.get("tx_id") as string)?.trim();
   const categoryId = (formData.get("category_id") as string)?.trim();
   const amount = (formData.get("amount") as string)?.trim();
   const note = (formData.get("note") as string)?.trim();
   const occurredAt = (formData.get("occurred_at") as string)?.trim();

   if (!projectId || !txId || !categoryId || !amount || !occurredAt) {
      return { error: "กรุณากรอกข้อมูลให้ครบถ้วน" };
   }

   const occurredAtISO = normalizeOccurredAt(occurredAt);
   if (!occurredAtISO) return { error: "วันที่รายการไม่ถูกต้อง" };

   try {
      const res = await fetch(
         `${API_URL}/projects/${projectId}/transactions/${txId}`,
         {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               category_id: categoryId,
               amount,
               note: note || undefined,
               occurred_at: occurredAtISO,
            }),
            cache: "no-store",
         },
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถแก้ไขรายการได้" };
      }

      revalidatePath(`/workspace/projects`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

export async function deleteTransactionAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };
   const projectId = (formData.get("project_id") as string)?.trim();
   const txId = (formData.get("tx_id") as string)?.trim();
   if (!projectId || !txId) return { error: "ไม่พบรายการธุรกรรม" };

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
