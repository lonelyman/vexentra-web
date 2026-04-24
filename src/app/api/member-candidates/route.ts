import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

type UserListItem = {
   person_id: string;
   username: string;
   email: string;
};

type Candidate = {
   person_id: string;
   username: string;
   email: string;
   display_name: string;
   headline: string;
   avatar_url: string;
};

export async function GET(req: Request) {
   const token = (await cookies()).get("token")?.value;
   if (!token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
   }

   const url = new URL(req.url);
   const cursor = url.searchParams.get("cursor") ?? "";
   const limit = Number(url.searchParams.get("limit") ?? 20);
   const search = (url.searchParams.get("search") ?? "").trim();

   const usersURL = new URL(`${API_URL}/users`);
   usersURL.searchParams.set("cursor", cursor);
   usersURL.searchParams.set("limit", String(Math.max(1, Math.min(50, limit))));
   usersURL.searchParams.set("status", "active");
   if (search) usersURL.searchParams.set("search", search);

   const usersRes = await fetch(usersURL.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!usersRes.ok) {
      const data = await usersRes.json().catch(() => ({}));
      return NextResponse.json({ error: data?.error?.message || "โหลดผู้ใช้งานไม่สำเร็จ" }, { status: usersRes.status });
   }

   const usersBody = await usersRes.json().catch(() => ({}));
   const users: UserListItem[] = usersBody?.data?.items ?? [];
   const pagination = usersBody?.data?.pagination ?? {};

   const profiles = await Promise.all(
      users.map(async (u) => {
         const res = await fetch(`${API_URL}/users/${u.person_id}/profile`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
         });
         if (!res.ok) {
            return {
               person_id: u.person_id,
               username: u.username,
               email: u.email,
               display_name: u.username,
               headline: "",
               avatar_url: "",
            } satisfies Candidate;
         }
         const body = await res.json().catch(() => ({}));
         const profile = body?.data?.profile ?? {};
         return {
            person_id: u.person_id,
            username: u.username,
            email: u.email,
            display_name: profile?.display_name || u.username,
            headline: profile?.headline || "",
            avatar_url: profile?.avatar_url || "",
         } satisfies Candidate;
      }),
   );

   return NextResponse.json({
      data: {
         items: profiles,
         pagination: {
            next_cursor: pagination?.next_cursor ?? null,
            has_more: Boolean(pagination?.has_more),
            limit: Number(pagination?.limit ?? limit),
         },
      },
   });
}
