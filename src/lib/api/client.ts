// src/lib/api/client.ts
// API fetch functions for the Vexentra backend

import type { FullProfileData, SocialPlatform } from "./types";

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
