import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { fetchProjectByCode } from "@/lib/api/client";

const INTERNAL_URL =
   process.env.INTERNAL_API_URL || "http://api:3000/api/v1";

export async function GET(
   _req: NextRequest,
   { params }: { params: Promise<{ code: string }> },
) {
   const token = (await cookies()).get("token")?.value;
   if (!token) {
      return NextResponse.redirect(new URL("/login", _req.url));
   }

   const { code } = await params;

   // Resolve code → project UUID (needed for the export endpoint)
   const { data: project, status: pStatus } = await fetchProjectByCode(
      token,
      code,
   );
   if (!project || pStatus !== 200) {
      return new NextResponse("Project not found", { status: pStatus });
   }

   // Proxy the CSV stream from the Go API
   const apiRes = await fetch(
      `${INTERNAL_URL}/projects/${project.id}/transactions/export`,
      {
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store",
      },
   );

   if (!apiRes.ok) {
      return new NextResponse("Export failed", { status: apiRes.status });
   }

   const filename = `transactions-${project.project_code}.csv`;
   return new NextResponse(apiRes.body, {
      status: 200,
      headers: {
         "Content-Type": "text/csv; charset=utf-8",
         "Content-Disposition": `attachment; filename="${filename}"`,
      },
   });
}
