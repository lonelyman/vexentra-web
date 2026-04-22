"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

type ActionState = { error?: string; success?: boolean };

export async function addMemberAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const projectId = formData.get("project_id") as string;
   const personId = (formData.get("person_id") as string)?.trim();

   if (!projectId || !personId) return { error: "กรุณาระบุข้อมูลให้ครบถ้วน" };

   try {
      const res = await fetch(`${API_URL}/projects/${projectId}/members`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({ person_id: personId }),
         cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถเพิ่มสมาชิกได้" };
      }

      revalidatePath(`/workspace/projects`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

export async function removeMemberAction(
   projectId: string,
   memberId: string,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   try {
      const res = await fetch(
         `${API_URL}/projects/${projectId}/members/${memberId}`,
         {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
         },
      );

      if (!res.ok && res.status !== 204) {
         const data = await res.json().catch(() => ({}));
         return { error: data.error?.message || "ไม่สามารถลบสมาชิกได้" };
      }

      revalidatePath(`/workspace/projects`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

export async function transferLeadAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const projectId = formData.get("project_id") as string;
   const personId = (formData.get("person_id") as string)?.trim();

   if (!projectId || !personId) return { error: "กรุณาระบุข้อมูลให้ครบถ้วน" };

   try {
      const res = await fetch(
         `${API_URL}/projects/${projectId}/transfer-lead`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ person_id: personId }),
            cache: "no-store",
         },
      );

      const data = await res.json();
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถโอนหัวหน้าทีมได้" };
      }

      revalidatePath(`/workspace/projects`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}
