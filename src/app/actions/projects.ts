"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || "http://api:3000/api/v1";
const PROJECT_KINDS = ["client_delivery", "internal_continuous"] as const;
const FINANCE_VISIBILITIES = [
   "all_members",
   "lead_coordinator_staff",
   "staff_only",
] as const;

type ActionState = { error?: string; success?: boolean };

async function fetchProjectStatusMaster(
   token: string,
): Promise<{ statuses: string[]; error?: string }> {
   try {
      const res = await fetch(`${API_URL}/project-statuses?active_only=false`, {
         headers: { Authorization: `Bearer ${token}` },
         cache: "no-store",
      });
      if (!res.ok) {
         return { statuses: [], error: "ไม่สามารถโหลดสถานะโครงการจาก master data ได้" };
      }

      const json = await res.json().catch(() => ({}));
      const items = (json.data?.items ?? json.data ?? []) as Array<{
         status?: string;
      }>;
      const statuses = items
         .map((item) => item.status?.trim().toLowerCase())
         .filter((status): status is string => Boolean(status));

      if (statuses.length === 0) {
         return { statuses: [], error: "ไม่พบสถานะโครงการใน master data" };
      }
      return { statuses };
   } catch {
      return { statuses: [], error: "ไม่สามารถเชื่อมต่อระบบสถานะโครงการได้" };
   }
}

export async function createProjectAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const name = (formData.get("name") as string)?.trim();
   const description = (formData.get("description") as string)?.trim();
   const rawProjectKind = (formData.get("project_kind") as string)?.trim();
   const projectKind = rawProjectKind || "client_delivery";

   if (!name) return { error: "กรุณาระบุชื่อโปรเจกต์" };
   if (!PROJECT_KINDS.includes(projectKind as (typeof PROJECT_KINDS)[number])) {
      return { error: "ประเภทโครงการไม่ถูกต้อง" };
   }

   try {
      const res = await fetch(`${API_URL}/projects`, {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
            name,
            project_kind: projectKind,
            description: description || undefined,
         }),
         cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถสร้างโปรเจกต์ได้" };
      }

      revalidatePath("/workspace/projects");
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

export async function updateProjectStatusAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const projectId = (formData.get("project_id") as string)?.trim();
   const projectCode = (formData.get("project_code") as string)?.trim();
   const name = (formData.get("name") as string)?.trim();
   const rawStatus = (formData.get("status") as string)?.trim();
   const rawProjectKind = (formData.get("project_kind") as string)?.trim();
   const projectKind = rawProjectKind || "client_delivery";
   const normalizedStatus = rawStatus?.toLowerCase().replace(/[\s-]+/g, "_");
   const statusMaster = await fetchProjectStatusMaster(token);
   if (statusMaster.error) return { error: statusMaster.error };
   const allowedStatuses = statusMaster.statuses;

   if (!projectId) return { error: "ไม่พบรหัสโปรเจกต์" };
   if (!projectCode) return { error: "ไม่พบ project code" };
   if (!name) return { error: "ไม่พบชื่อโปรเจกต์" };
   if (!normalizedStatus) return { error: "กรุณาเลือกสถานะโปรเจกต์" };
   if (!PROJECT_KINDS.includes(projectKind as (typeof PROJECT_KINDS)[number])) {
      return { error: "ประเภทโครงการไม่ถูกต้อง" };
   }
   if (!allowedStatuses.includes(normalizedStatus)) {
      return { error: `สถานะโปรเจกต์ไม่ถูกต้อง: ${rawStatus}` };
   }
   const status = normalizedStatus;

   if (status === "closed") {
      const reason = (formData.get("reason") as string)?.trim();
      const closedAtRaw = (formData.get("closed_at") as string)?.trim();
      if (!reason) return { error: "กรุณาเลือกเหตุผลการปิดโครงการ" };
      if (!closedAtRaw) return { error: "กรุณาระบุวันที่ปิดโครงการ" };

      const closedAt = new Date(closedAtRaw);
      if (Number.isNaN(closedAt.getTime())) {
         return { error: "วันที่ปิดโครงการไม่ถูกต้อง" };
      }

      try {
         const res = await fetch(`${API_URL}/projects/${projectId}/close`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
               reason,
               closed_at: closedAt.toISOString(),
            }),
            cache: "no-store",
         });

         const data = await res.json().catch(() => ({}));
         if (!res.ok) {
            return { error: data.error?.message || "ไม่สามารถปิดโครงการได้" };
         }

         revalidatePath("/workspace/projects");
         revalidatePath(`/workspace/projects/${projectCode}`);
         return { success: true };
      } catch {
         return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
      }
   }

   const description = (formData.get("description") as string)?.trim() || null;
   const clientPersonId =
      (formData.get("client_person_id") as string)?.trim() || null;
   const clientNameRaw =
      (formData.get("client_name_raw") as string)?.trim() || null;
   const clientEmailRaw =
      (formData.get("client_email_raw") as string)?.trim() || null;
   const scheduledStartAt =
      (formData.get("scheduled_start_at") as string)?.trim() || null;
   const deadlineAt = (formData.get("deadline_at") as string)?.trim() || null;

   try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
            name,
            project_kind: projectKind,
            description,
            status,
            client_person_id: clientPersonId,
            client_name_raw: clientNameRaw,
            client_email_raw: clientEmailRaw,
            scheduled_start_at: scheduledStartAt,
            deadline_at: deadlineAt,
         }),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถเปลี่ยนสถานะโปรเจกต์ได้" };
      }

      revalidatePath("/workspace/projects");
      revalidatePath(`/workspace/projects/${projectCode}`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

export async function updateProjectSettingsAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const projectId = (formData.get("project_id") as string)?.trim();
   const projectCode = (formData.get("project_code") as string)?.trim();
   const name = (formData.get("name") as string)?.trim();
   const rawStatus = (formData.get("status") as string)?.trim();
   const status = rawStatus?.toLowerCase().replace(/[\s-]+/g, "_");
   const rawProjectKind = (formData.get("project_kind") as string)?.trim();
   const projectKind = rawProjectKind || "client_delivery";
   const contractFinanceVisibility = (formData.get("contract_finance_visibility") as string)?.trim();
   const expenseFinanceVisibility = (formData.get("expense_finance_visibility") as string)?.trim();

   if (!projectId) return { error: "ไม่พบรหัสโปรเจกต์" };
   if (!projectCode) return { error: "ไม่พบ project code" };
   if (!name) return { error: "ไม่พบชื่อโปรเจกต์" };
   if (!status) return { error: "ไม่พบสถานะโปรเจกต์" };
   if (!PROJECT_KINDS.includes(projectKind as (typeof PROJECT_KINDS)[number])) {
      return { error: "ประเภทโครงการไม่ถูกต้อง" };
   }
   if (
      !contractFinanceVisibility ||
      !FINANCE_VISIBILITIES.includes(
         contractFinanceVisibility as (typeof FINANCE_VISIBILITIES)[number],
      )
   ) {
      return { error: "สิทธิ์ข้อมูลส่วนว่าจ้างไม่ถูกต้อง" };
   }
   if (
      !expenseFinanceVisibility ||
      !FINANCE_VISIBILITIES.includes(
         expenseFinanceVisibility as (typeof FINANCE_VISIBILITIES)[number],
      )
   ) {
      return { error: "สิทธิ์ข้อมูลส่วนค่าใช้จ่ายไม่ถูกต้อง" };
   }

   const description = (formData.get("description") as string)?.trim() || null;
   const clientPersonId =
      (formData.get("client_person_id") as string)?.trim() || null;
   const clientNameRaw =
      (formData.get("client_name_raw") as string)?.trim() || null;
   const clientEmailRaw =
      (formData.get("client_email_raw") as string)?.trim() || null;
   const scheduledStartAt =
      (formData.get("scheduled_start_at") as string)?.trim() || null;
   const deadlineAt = (formData.get("deadline_at") as string)?.trim() || null;

   try {
      const res = await fetch(`${API_URL}/projects/${projectId}`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
            name,
            status,
            project_kind: projectKind,
            contract_finance_visibility: contractFinanceVisibility,
            expense_finance_visibility: expenseFinanceVisibility,
            description,
            client_person_id: clientPersonId,
            client_name_raw: clientNameRaw,
            client_email_raw: clientEmailRaw,
            scheduled_start_at: scheduledStartAt,
            deadline_at: deadlineAt,
         }),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถบันทึก Project Settings ได้" };
      }

      revalidatePath("/workspace/projects");
      revalidatePath(`/workspace/projects/${projectCode}`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}

function normalizeDateInput(raw: string | null): string | null {
   const value = raw?.trim();
   if (!value) return null;
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return null;
   return d.toISOString();
}

export async function upsertProjectFinancialPlanAction(
   _prev: ActionState,
   formData: FormData,
): Promise<ActionState> {
   const token = (await cookies()).get("token")?.value;
   if (!token) return { error: "กรุณาเข้าสู่ระบบ" };

   const projectId = (formData.get("project_id") as string)?.trim();
   const projectCode = (formData.get("project_code") as string)?.trim();
   const contractAmountRaw = (formData.get("contract_amount") as string)?.trim();
   const retentionAmountRaw =
      (formData.get("retention_amount") as string)?.trim() || "0";
   const plannedDeliveryRaw = formData.get("planned_delivery_date") as string | null;
   const paymentNote = (formData.get("payment_note") as string)?.trim() || null;
   const installmentsJSON = (formData.get("installments_json") as string)?.trim();

   if (!projectId) return { error: "ไม่พบรหัสโปรเจกต์" };
   if (!projectCode) return { error: "ไม่พบ project code" };
   if (!contractAmountRaw) return { error: "กรุณาระบุค่าจ้างตามสัญญา" };

   const contractAmount = Number(contractAmountRaw);
   const retentionAmount = Number(retentionAmountRaw);
   if (!Number.isFinite(contractAmount) || contractAmount < 0) {
      return { error: "ค่าจ้างตามสัญญาไม่ถูกต้อง" };
   }
   if (!Number.isFinite(retentionAmount) || retentionAmount < 0) {
      return { error: "เงินประกันไม่ถูกต้อง" };
   }
   if (retentionAmount > contractAmount) {
      return { error: "เงินประกันต้องไม่เกินค่าจ้างตามสัญญา" };
   }

   let installments: Array<{
      sort_order: number;
      title: string;
      amount: number;
      planned_delivery_date: string | null;
      planned_receive_date: string | null;
      note: string | null;
   }> = [];
   if (installmentsJSON) {
      try {
         const parsed = JSON.parse(installmentsJSON) as Array<{
            sort_order?: number;
            title?: string;
            amount?: number;
            planned_delivery_date?: string | null;
            planned_receive_date?: string | null;
            note?: string | null;
         }>;
         installments = parsed
            .map((item, idx) => ({
               sort_order: item.sort_order && item.sort_order > 0 ? item.sort_order : idx + 1,
               title: (item.title ?? "").trim(),
               amount: Number(item.amount ?? 0),
               planned_delivery_date: normalizeDateInput(item.planned_delivery_date ?? null),
               planned_receive_date: normalizeDateInput(item.planned_receive_date ?? null),
               note: item.note?.trim() || null,
            }))
            .filter((item) => item.title && item.amount > 0);
      } catch {
         return { error: "รูปแบบข้อมูลงวดชำระไม่ถูกต้อง" };
      }
   }

   try {
      const res = await fetch(`${API_URL}/projects/${projectId}/financial-plan`, {
         method: "PUT",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
         },
         body: JSON.stringify({
            contract_amount: contractAmount.toFixed(2),
            retention_amount: retentionAmount.toFixed(2),
            planned_delivery_date: normalizeDateInput(plannedDeliveryRaw),
            payment_note: paymentNote,
            installments: installments.map((item) => ({
               ...item,
               amount: item.amount.toFixed(2),
            })),
         }),
         cache: "no-store",
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
         return { error: data.error?.message || "ไม่สามารถบันทึกแผนค่าจ้างได้" };
      }

      revalidatePath(`/workspace/projects/${projectCode}`);
      return { success: true };
   } catch {
      return { error: "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่" };
   }
}
