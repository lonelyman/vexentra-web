"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

type ActionState = { error?: string; success?: boolean };

export async function createTaskAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const projectId = formData.get("project_id") as string;
   const title = (formData.get("title") as string)?.trim();
   const description = (formData.get("description") as string)?.trim();
   const priority = (formData.get("priority") as string) || "medium";
   const dueDate = (formData.get("due_date") as string)?.trim();

   if (!title) return { error: "กรุณาระบุชื่องาน" };

   try {
      const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
            title,
            description: description || undefined,
            priority,
            due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
         }),
         cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถสร้างงานได้" };

      revalidatePath("/workspace/projects");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

export async function updateTaskStatusAction(
   projectId: string,
   taskId: string,
   patch: {
      title: string;
      description: string | null;
      status: string;
      priority: string;
      assigned_person_id: string | null;
      due_date: string | null;
   },
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   try {
      const res = await fetch(
         `${API_URL}/projects/${projectId}/tasks/${taskId}`,
         {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(patch),
            cache: "no-store",
         },
      );

      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถอัปเดตงานได้" };

      revalidatePath("/workspace/projects");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

export async function deleteTaskAction(
   projectId: string,
   taskId: string,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   try {
      const res = await fetch(
         `${API_URL}/projects/${projectId}/tasks/${taskId}`,
         {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
         },
      );

      if (!res.ok && res.status !== 204) {
         const data = await res.json().catch(() => ({}));
         return { error: data.error?.message || "ไม่สามารถลบงานได้" };
      }

      revalidatePath("/workspace/projects");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}
