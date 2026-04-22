// src/lib/auth/requireAuth.ts
// Centralised server-side auth guard for Server Components and Route Handlers.
//
// Usage:
//   const token = await requireAuth("/workspace/projects");
//
// Behaviour:
//   1. If `token` cookie exists     → return the token string.
//   2. If `token` missing but `refresh_token` exists → redirect to refresh endpoint.
//   3. If neither cookie exists     → redirect to /login.
//   4. After you call an API and get status 401 → call handleAuthError(401, redirectTo).

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Must be called at the top of every authenticated Server Component.
 * Returns the access token string; never returns if the user is unauthenticated.
 */
export async function requireAuth(redirectTo: string = "/"): Promise<string> {
   const cookieStore = await cookies();
   const token = cookieStore.get("token")?.value;
   const refreshToken = cookieStore.get("refresh_token")?.value;

   if (!token) {
      if (refreshToken) {
         redirect(
            `/api/refresh-session?redirect=${encodeURIComponent(redirectTo)}`,
         );
      }
      redirect("/login");
   }

   return token;
}

/**
 * Call this after receiving an API response that has no data.
 * Handles 401 (token expired) vs other errors in a single place.
 */
export function handleAuthError(
   status: number,
   redirectTo: string = "/",
): never {
   if (status === 401) {
      redirect(
         `/api/refresh-session?redirect=${encodeURIComponent(redirectTo)}`,
      );
   }
   redirect("/api/clear-session");
}
