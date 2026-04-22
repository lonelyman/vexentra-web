// src/lib/api/client.ts
// API fetch functions for the Vexentra backend

import type {
   FullProfileData,
   SocialPlatform,
   UserMe,
   ProjectListResult,
} from "./types";

const API_URL =
   typeof window === "undefined"
      ? process.env.INTERNAL_API_URL || "http://api:3000/api/v1"
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function fetchShowcase(): Promise<FullProfileData | null> {
   try {
      const res = await fetch(`${API_URL}/showcase`, { cache: "no-store" });
      if (!res.ok) {
         if (res.status === 404) return null;
         throw new Error(`Failed to fetch showcase: ${res.status}`);
      }
      const json = await res.json();
      return json.data ?? null;
   } catch (error) {
      console.error("API Error:", error);
      return null;
   }
}

export async function fetchSocialPlatforms(): Promise<SocialPlatform[]> {
   try {
      const res = await fetch(`${API_URL}/social-platforms`, {
         cache: "no-store",
      });
      if (!res.ok) {
         throw new Error(`Failed to fetch social platforms: ${res.status}`);
      }
      const json = await res.json();
      return json.data?.items ?? json.data ?? json ?? [];
   } catch (error) {
      console.error("API Error:", error);
      return [];
   }
}

// ─── Authenticated helpers (server-side only — use INTERNAL_API_URL) ──────────

const INTERNAL_URL =
   process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

export async function fetchMe(
   token: string,
): Promise<{ data: UserMe | null; status: number }> {
   const res = await fetch(`${INTERNAL_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}

export async function fetchProjects(
   token: string,
   params?: {
      page?: number;
      limit?: number;
      search?: string;
      status?: string;
   },
): Promise<{ data: ProjectListResult | null; status: number }> {
   const url = new URL(`${INTERNAL_URL}/projects`);
   if (params?.page) url.searchParams.set("page", String(params.page));
   if (params?.limit) url.searchParams.set("limit", String(params.limit));
   if (params?.search) url.searchParams.set("search", params.search);
   if (params?.status) url.searchParams.set("status", params.status);

   const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}
