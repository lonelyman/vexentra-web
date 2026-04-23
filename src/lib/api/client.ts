// src/lib/api/client.ts
// API fetch functions for the Vexentra backend

import type {
   FullProfileData,
   SocialPlatform,
   UserMe,
   UserListResult,
   UserCursorListResult,
   Project,
   ProjectListResult,
   TransactionCategory,
   TransactionListResult,
   ProjectTotals,
   Member,
   DashboardStats,
   TaskListResult,
   ProjectStatusMeta,
   ProjectFinancialPlan,
} from "./types";

const API_URL =
   typeof window === "undefined"
      ? process.env.INTERNAL_API_URL || "http://api:3000/api/v1"
      : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function fetchShowcase(): Promise<FullProfileData | null> {
   try {
      const res = await fetch(`${API_URL}/showcase`, {
         next: { revalidate: 60 },
      });
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

export async function fetchShowcaseByPersonID(
   personID: string,
): Promise<FullProfileData | null> {
   try {
      const res = await fetch(`${API_URL}/showcase/${encodeURIComponent(personID)}`, {
         next: { revalidate: 60 },
      });
      if (!res.ok) {
         if (res.status === 404) return null;
         throw new Error(`Failed to fetch showcase by person id: ${res.status}`);
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
         next: { revalidate: 300 },
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

const INTERNAL_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

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

export async function fetchProjectByCode(
   token: string,
   code: string,
): Promise<{ data: Project | null; status: number }> {
   const res = await fetch(
      `${INTERNAL_URL}/projects/by-code/${encodeURIComponent(code)}`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
   );
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
      project_kind?: string;
   },
): Promise<{ data: ProjectListResult | null; status: number }> {
   const url = new URL(`${INTERNAL_URL}/projects`);
   if (params?.page) url.searchParams.set("page", String(params.page));
   if (params?.limit) url.searchParams.set("limit", String(params.limit));
   if (params?.search) url.searchParams.set("search", params.search);
   if (params?.status) url.searchParams.set("status", params.status);
   if (params?.project_kind) url.searchParams.set("project_kind", params.project_kind);

   const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}

export async function fetchProjectStatuses(
   token: string,
   params?: { activeOnly?: boolean },
): Promise<{ data: ProjectStatusMeta[] | null; status: number }> {
   const url = new URL(`${INTERNAL_URL}/project-statuses`);
   if (params?.activeOnly !== undefined) {
      url.searchParams.set("active_only", String(params.activeOnly));
   }

   const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data?.items ?? json.data ?? null, status: res.status };
}

export async function fetchTransactions(
   token: string,
   projectId: string,
   params?: { page?: number; limit?: number },
): Promise<{ data: TransactionListResult | null; status: number }> {
   const url = new URL(`${INTERNAL_URL}/projects/${projectId}/transactions`);
   if (params?.page) url.searchParams.set("page", String(params.page));
   if (params?.limit) url.searchParams.set("limit", String(params.limit));

   const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}

export async function fetchProjectFinancialPlan(
   token: string,
   projectId: string,
): Promise<{ data: ProjectFinancialPlan | null; status: number }> {
   const res = await fetch(`${INTERNAL_URL}/projects/${projectId}/financial-plan`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}

export async function fetchTransactionSummary(
   token: string,
   projectId: string,
): Promise<{ data: ProjectTotals | null; status: number }> {
   const res = await fetch(
      `${INTERNAL_URL}/projects/${projectId}/transactions/summary`,
      { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" },
   );
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}

export async function fetchMembers(
   token: string,
   projectId: string,
): Promise<{ data: Member[] | null; status: number }> {
   const res = await fetch(`${INTERNAL_URL}/projects/${projectId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data?.items ?? json.data ?? null, status: res.status };
}

export async function fetchTasks(
   token: string,
   projectId: string,
   params?: { status?: string; page?: number; limit?: number },
): Promise<{ data: TaskListResult | null; status: number }> {
   const url = new URL(`${INTERNAL_URL}/projects/${projectId}/tasks`);
   if (params?.status) url.searchParams.set("status", params.status);
   if (params?.page) url.searchParams.set("page", String(params.page));
   if (params?.limit) url.searchParams.set("limit", String(params.limit));

   const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}

export async function fetchDashboardStats(
   token: string,
): Promise<{ data: DashboardStats | null; status: number }> {
   const res = await fetch(`${INTERNAL_URL}/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}

export async function fetchUsers(
   token: string,
   params?: { page?: number; limit?: number; search?: string; status?: string },
): Promise<{ data: UserListResult | null; status: number }> {
   const url = new URL(`${INTERNAL_URL}/users`);
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

export async function fetchUsersCursor(
   token: string,
   params?: { cursor?: string; limit?: number; search?: string; status?: string },
): Promise<{ data: UserCursorListResult | null; status: number }> {
   const url = new URL(`${INTERNAL_URL}/users`);
   if (params?.cursor !== undefined) url.searchParams.set("cursor", params.cursor);
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

export async function fetchUserById(
   token: string,
   userId: string,
): Promise<{ data: UserMe | null; status: number }> {
   const res = await fetch(`${INTERNAL_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}

export async function fetchPersonProfile(
   token: string,
   personId: string,
): Promise<{ data: FullProfileData | null; status: number }> {
   const res = await fetch(`${INTERNAL_URL}/users/${personId}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data ?? null, status: res.status };
}

export async function fetchTxCategories(
   token: string,
): Promise<{ data: TransactionCategory[] | null; status: number }> {
   const res = await fetch(`${INTERNAL_URL}/tx-categories`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
   });
   if (!res.ok) return { data: null, status: res.status };
   const json = await res.json();
   return { data: json.data?.items ?? json.data ?? null, status: res.status };
}
