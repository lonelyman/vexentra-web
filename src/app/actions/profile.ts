"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

type ActionState = { error?: string; success?: boolean; message?: string };

function parseSortOrder(v: FormDataEntryValue | null): number {
   const n = Number(v ?? 0);
   return Number.isFinite(n) ? n : 0;
}

function toRFC3339DateStart(date: string): string {
   return `${date}T00:00:00Z`;
}

function normalizeOptionalURL(raw: string): string {
   const v = raw.trim();
   if (!v) return "";
   try {
      const u = new URL(v);
      if (u.protocol === "http:" || u.protocol === "https:") return v;
      return "";
   } catch {
      return "";
   }
}

async function getToken(): Promise<string | null> {
   return (await cookies()).get("token")?.value ?? null;
}

function revalidateMyProfilePages() {
   revalidatePath("/");
   revalidatePath("/portfolio");
   revalidatePath("/workspace/profile");
}

export async function updateProfileAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "ไม่พบการยืนยันตัวตน กรุณาล็อกอินใหม่" };

   const displayName = ((formData.get("display_name") as string) || "").trim();
   if (!displayName) {
      return { error: "กรุณากรอกชื่อแสดงผล" };
   }
   const headline = ((formData.get("headline") as string) || "").trim();
   if (!headline) {
      return { error: "กรุณากรอก Headline" };
   }

   const body = {
      display_name: displayName,
      headline,
      bio: (formData.get("bio") as string) || "",
      location: (formData.get("location") as string) || "",
      avatar_url: normalizeOptionalURL((formData.get("avatar_url") as string) || ""),
   };

   try {
      const res = await fetch(`${API_URL}/me/profile`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(body),
         cache: "no-store",
      });

      if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         return { error: data.error?.message || "บันทึกข้อมูลไม่สำเร็จ" };
      }

      revalidateMyProfilePages();
      return { success: true, message: "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว" };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function changeMyPasswordAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const currentPassword = (formData.get("current_password") as string) || "";
   const newPassword = (formData.get("new_password") as string) || "";
   const rePassword = (formData.get("re_password") as string) || "";

   if (newPassword !== rePassword) {
      return { error: "ยืนยันรหัสผ่านใหม่ไม่ตรงกัน" };
   }

   try {
      const res = await fetch(`${API_URL}/me/password`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
         }),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้" };
      }
      return { success: true, message: "เปลี่ยนรหัสผ่านเรียบร้อย" };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function addMySkillAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const body = {
      name: (formData.get("name") as string) || "",
      category: (formData.get("category") as string) || "other",
      proficiency: Number(formData.get("proficiency") || 3),
      sort_order: parseSortOrder(formData.get("sort_order")),
   };

   try {
      const res = await fetch(`${API_URL}/me/skills`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(body),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถเพิ่มทักษะได้" };

      revalidatePath("/workspace/profile");
      revalidatePath("/portfolio");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function updateMySkillAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const skillId = (formData.get("skill_id") as string) || "";
   const body = {
      name: (formData.get("name") as string) || "",
      category: (formData.get("category") as string) || "other",
      proficiency: Number(formData.get("proficiency") || 3),
      sort_order: parseSortOrder(formData.get("sort_order")),
   };

   try {
      const res = await fetch(`${API_URL}/me/skills/${skillId}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(body),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถแก้ไขทักษะได้" };

      revalidatePath("/workspace/profile");
      revalidatePath("/portfolio");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function deleteMySkillAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const skillId = (formData.get("skill_id") as string) || "";

   try {
      const res = await fetch(`${API_URL}/me/skills/${skillId}`, {
         method: "DELETE",
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store",
      });

      if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         return { error: data.error?.message || "ไม่สามารถลบทักษะได้" };
      }

      revalidatePath("/workspace/profile");
      revalidatePath("/portfolio");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function addMyExperienceAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

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
      const res = await fetch(`${API_URL}/me/experiences`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(body),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถเพิ่มประวัติการทำงานได้" };
      }

      revalidatePath("/workspace/profile");
      revalidatePath("/portfolio");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function updateMyExperienceAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const expId = (formData.get("exp_id") as string) || "";
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
      const res = await fetch(`${API_URL}/me/experiences/${expId}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(body),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถแก้ไขประวัติการทำงานได้" };
      }

      revalidatePath("/workspace/profile");
      revalidatePath("/portfolio");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function deleteMyExperienceAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const expId = (formData.get("exp_id") as string) || "";

   try {
      const res = await fetch(`${API_URL}/me/experiences/${expId}`, {
         method: "DELETE",
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store",
      });

      if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         return { error: data.error?.message || "ไม่สามารถลบประวัติการทำงานได้" };
      }

      revalidatePath("/workspace/profile");
      revalidatePath("/portfolio");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function addMyPortfolioAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const startedAt = (formData.get("started_at") as string) || "";
   const endedAt = (formData.get("ended_at") as string) || "";
   const tagsRaw = ((formData.get("tags") as string) || "").trim();

   const body = {
      title: (formData.get("title") as string) || "",
      summary: (formData.get("summary") as string) || "",
      description: (formData.get("description") as string) || "",
      cover_image_url: normalizeOptionalURL((formData.get("cover_image_url") as string) || ""),
      demo_url: normalizeOptionalURL((formData.get("demo_url") as string) || ""),
      source_url: normalizeOptionalURL((formData.get("source_url") as string) || ""),
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
      const res = await fetch(`${API_URL}/me/portfolio`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(body),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) return { error: data.error?.message || "ไม่สามารถเพิ่มผลงานได้" };

      revalidatePath("/workspace/profile");
      revalidatePath("/portfolio");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function updateMyPortfolioAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const itemId = (formData.get("item_id") as string) || "";
   const startedAt = (formData.get("started_at") as string) || "";
   const endedAt = (formData.get("ended_at") as string) || "";
   const tagsRaw = ((formData.get("tags") as string) || "").trim();

   const body = {
      title: (formData.get("title") as string) || "",
      summary: (formData.get("summary") as string) || "",
      description: (formData.get("description") as string) || "",
      cover_image_url: normalizeOptionalURL((formData.get("cover_image_url") as string) || ""),
      demo_url: normalizeOptionalURL((formData.get("demo_url") as string) || ""),
      source_url: normalizeOptionalURL((formData.get("source_url") as string) || ""),
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
      const res = await fetch(`${API_URL}/me/portfolio/${itemId}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify(body),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถแก้ไขผลงานได้" };
      }

      revalidatePath("/workspace/profile");
      revalidatePath("/portfolio");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}

export async function deleteMyPortfolioAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = await getToken();
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const itemId = (formData.get("item_id") as string) || "";

   try {
      const res = await fetch(`${API_URL}/me/portfolio/${itemId}`, {
         method: "DELETE",
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store",
      });

      if (!res.ok) {
         const data = await res.json().catch(() => ({}));
         return { error: data.error?.message || "ไม่สามารถลบผลงานได้" };
      }

      revalidatePath("/workspace/profile");
      revalidatePath("/portfolio");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
   }
}
