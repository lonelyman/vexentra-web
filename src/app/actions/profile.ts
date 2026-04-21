"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

export async function updateProfileAction(prevState: any, formData: FormData) {
  const token = (await cookies()).get("token")?.value;
  if (!token) return { error: "ไม่พบการยืนยันตัวตน กรุณาล็อกอินใหม่" };

  const displayName = formData.get("display_name") as string;
  const headline = formData.get("headline") as string;
  const bio = formData.get("bio") as string;
  const location = formData.get("location") as string;
  const avatarUrl = formData.get("avatar_url") as string;

  try {
    const res = await fetch(`${API_URL}/me/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        display_name: displayName,
        headline,
        bio,
        location,
        avatar_url: avatarUrl
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.error?.message || "บันทึกข้อมูลไม่สำเร็จ" };
    }

    // Refresh data across the app
    revalidatePath("/");
    revalidatePath("/admin");

    return { success: true, message: "บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว!" };
  } catch (error) {
    console.error("Update Profile Error:", error);
    return { error: "ไม่สามารถเชื่อมต่อระบบได้" };
  }
}
