"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

type ActionState = { error?: string; success?: boolean };

function parseSortOrder(v: FormDataEntryValue | null): number {
   const n = Number(v ?? 0);
   return Number.isFinite(n) ? n : 0;
}

function toRFC3339DateStart(date: string): string {
   return `${date}T00:00:00Z`;
}

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

export async function adminCreateUserAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const email = formData.get("email") as string;
   const password = formData.get("password") as string;
   const display_name = formData.get("display_name") as string;
   const role = formData.get("role") as string;

   try {
      const res = await fetch(`${API_URL}/users`, {
         method: "POST",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
         body: JSON.stringify({ email, password, display_name, role }),
         cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถสร้างผู้ใช้งานได้" };

      revalidatePath("/workspace/persons");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function adminSetUserPasswordAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const userId = formData.get("user_id") as string;
   const newPassword = formData.get("new_password") as string;
   const rePassword = formData.get("re_password") as string;

   try {
      const res = await fetch(`${API_URL}/users/${userId}/password`, {
         method: "PUT",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
         body: JSON.stringify({ new_password: newPassword, re_password: rePassword }),
         cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถเปลี่ยนรหัสผ่านผู้ใช้งานได้" };

      revalidatePath(`/workspace/persons/${userId}/edit`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function adminUpdateProfileAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const userId = formData.get("user_id") as string;

   const body = {
      display_name: formData.get("display_name") as string,
      headline: formData.get("headline") as string,
      bio: formData.get("bio") as string,
      location: formData.get("location") as string,
      avatar_url: formData.get("avatar_url") as string,
   };

   try {
      const res = await fetch(`${API_URL}/users/${userId}/profile`, {
         method: "PUT",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
         body: JSON.stringify(body),
         cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถอัปเดตโปรไฟล์ได้" };

      revalidatePath(`/workspace/persons/${userId}/edit`);
      revalidatePath("/workspace/persons");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function adminAddSkillAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const userId = formData.get("user_id") as string;
   const body = {
      name: (formData.get("name") as string) || "",
      category: (formData.get("category") as string) || "other",
      proficiency: Number(formData.get("proficiency") || 3),
      sort_order: parseSortOrder(formData.get("sort_order")),
   };

   try {
      const res = await fetch(`${API_URL}/users/${userId}/skills`, {
         method: "POST",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
         body: JSON.stringify(body),
         cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถเพิ่มทักษะได้" };
      revalidatePath(`/workspace/persons/${userId}/edit`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function adminAddExperienceAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const userId = formData.get("user_id") as string;
   const startedAt = (formData.get("started_at") as string) || "";
   const endedAt = (formData.get("ended_at") as string) || "";
   const isCurrent = formData.get("is_current") === "on";

   const body = {
      company: (formData.get("company") as string) || "",
      position: (formData.get("position") as string) || "",
      location: (formData.get("location") as string) || "",
      description: (formData.get("description") as string) || "",
      started_at: startedAt ? toRFC3339DateStart(startedAt) : "",
      ended_at: isCurrent || !endedAt ? null : toRFC3339DateStart(endedAt),
      is_current: isCurrent,
      sort_order: parseSortOrder(formData.get("sort_order")),
   };

   try {
      const res = await fetch(`${API_URL}/users/${userId}/experiences`, {
         method: "POST",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
         body: JSON.stringify(body),
         cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถเพิ่มประวัติการทำงานได้" };
      revalidatePath(`/workspace/persons/${userId}/edit`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function adminUpdateExperienceAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const userId = formData.get("user_id") as string;
   const expId = formData.get("exp_id") as string;
   const startedAt = (formData.get("started_at") as string) || "";
   const endedAt = (formData.get("ended_at") as string) || "";
   const isCurrent = formData.get("is_current") === "on";

   const body = {
      company: (formData.get("company") as string) || "",
      position: (formData.get("position") as string) || "",
      location: (formData.get("location") as string) || "",
      description: (formData.get("description") as string) || "",
      started_at: startedAt ? toRFC3339DateStart(startedAt) : "",
      ended_at: isCurrent || !endedAt ? null : toRFC3339DateStart(endedAt),
      is_current: isCurrent,
      sort_order: parseSortOrder(formData.get("sort_order")),
   };

   try {
      const res = await fetch(`${API_URL}/users/${userId}/experiences/${expId}`, {
         method: "PUT",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
         body: JSON.stringify(body),
         cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถแก้ไขประวัติการทำงานได้" };
      revalidatePath(`/workspace/persons/${userId}/edit`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function adminDeleteExperienceAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const userId = formData.get("user_id") as string;
   const expId = formData.get("exp_id") as string;

   try {
      const res = await fetch(`${API_URL}/users/${userId}/experiences/${expId}`, {
         method: "DELETE",
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store",
      });

      if (!res.ok) {
         const data = await res.json();
         return { error: data.error?.message || "ไม่สามารถลบประวัติการทำงานได้" };
      }

      revalidatePath(`/workspace/persons/${userId}/edit`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function adminAddPortfolioAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const userId = formData.get("user_id") as string;
   const startedAt = (formData.get("started_at") as string) || "";
   const endedAt = (formData.get("ended_at") as string) || "";
   const tagsRaw = ((formData.get("tags") as string) || "").trim();

   const body = {
      title: (formData.get("title") as string) || "",
      summary: (formData.get("summary") as string) || "",
      description: (formData.get("description") as string) || "",
      cover_image_url: (formData.get("cover_image_url") as string) || "",
      demo_url: (formData.get("demo_url") as string) || "",
      source_url: (formData.get("source_url") as string) || "",
      status: (formData.get("status") as string) || "draft",
      featured: formData.get("featured") === "on",
      sort_order: parseSortOrder(formData.get("sort_order")),
      started_at: startedAt ? toRFC3339DateStart(startedAt) : null,
      ended_at: endedAt ? toRFC3339DateStart(endedAt) : null,
      tags: tagsRaw
         ? tagsRaw
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
         : [],
   };

   try {
      const res = await fetch(`${API_URL}/users/${userId}/portfolio`, {
         method: "POST",
         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
         body: JSON.stringify(body),
         cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถเพิ่มผลงานได้" };
      revalidatePath(`/workspace/persons/${userId}/edit`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}
