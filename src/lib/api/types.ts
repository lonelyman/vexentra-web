// src/lib/api/types.ts
// All shared data-transfer types for the Vexentra API

export interface SocialPlatform {
   id: string;
   key: string;
   name: string;
   icon_url: string;
   sort_order: number;
   is_active: boolean;
}

export interface SocialLink {
   id: string;
   platform_id: string;
   url: string;
   sort_order: number;
}

export interface Profile {
   display_name: string;
   headline: string;
   bio: string;
   location: string;
   avatar_url: string;
   social_links: SocialLink[];
}

export interface Skill {
   id: string;
   name: string;
   category: string;
   proficiency: number;
   sort_order: number;
}

export interface Experience {
   id: string;
   company: string;
   position: string;
   location: string;
   description: string;
   started_at: string;
   ended_at: string | null;
   is_current: boolean;
   sort_order: number;
}

export interface PortfolioTag {
   id: string;
   name: string;
   slug: string;
}

export interface PortfolioItem {
   id: string;
   title: string;
   slug: string;
   summary: string;
   description: string;
   cover_image_url: string;
   demo_url: string;
   source_url: string;
   status: string;
   featured: boolean;
   tags: PortfolioTag[];
}

export interface FullProfileData {
   user: { id: string; username: string };
   profile: Profile | null;
   skills: Skill[];
   experiences: Experience[];
   portfolio: PortfolioItem[];
}

// ─── Workspace / Project Management ───────────────────────────────────────────

export interface UserListItem {
   id: string;
   person_id: string;
   username: string;
   email: string;
   role: string;
   status: string;
   is_email_verified: boolean;
   last_login_at: string | null;
   created_at: string;
}

export interface UserListResult {
   items: UserListItem[];
   pagination: {
      total_records: number;
      total_pages: number;
      current_page: number;
      page_size: number;
   };
}

export interface UserMe {
   id: string;
   person_id: string;
   username: string;
   email: string;
   role: string;
   status: string;
   is_email_verified: boolean;
   last_login_at: string | null;
   created_at: string;
}

export type ProjectStatus =
   | "draft"
   | "planned"
   | "bidding"
   | "active"
   | "on_hold"
   | "closed";

export type ProjectStatusPhase =
   | "backlog"
   | "pre_sales"
   | "delivery"
   | "terminal";

export interface ProjectStatusMeta {
   status: ProjectStatus;
   label_th: string;
   phase: ProjectStatusPhase;
   sort_order: number;
   is_terminal: boolean;
   requires_client: boolean;
   is_active: boolean;
}

export interface Project {
   id: string;
   project_code: string;
   name: string;
   description: string | null;
   status: ProjectStatus;
   client_person_id: string | null;
   client_name_raw: string | null;
   client_email_raw: string | null;
   scheduled_start_at: string | null;
   deadline_at: string | null;
   activated_at: string | null;
   closed_at: string | null;
   closure_reason: string | null;
   created_by_user_id: string;
   created_at: string;
   updated_at: string;
}

export interface ProjectPaymentInstallment {
   id: string;
   project_id: string;
   sort_order: number;
   title: string;
   amount: string;
   planned_delivery_date: string | null;
   planned_receive_date: string | null;
   note: string | null;
   created_at: string;
   updated_at: string;
}

export interface ProjectFinancialPlan {
   project_id: string;
   contract_amount: string;
   retention_amount: string;
   planned_delivery_date: string | null;
   payment_note: string | null;
   installments: ProjectPaymentInstallment[];
   installments_total: string;
   net_receivable: string;
   unallocated_remaining: string;
   created_at: string;
   updated_at: string;
}

export interface Pagination {
   total_records: number;
   total_pages: number;
   current_page: number;
   per_page: number;
   has_more: boolean;
}

export interface ProjectListResult {
   items: Project[];
   pagination: Pagination;
}

export interface TransactionCategory {
   id: string;
   code: string;
   name: string;
   type: "income" | "expense";
   icon_key: string | null;
   is_active: boolean;
   is_system: boolean;
   sort_order: number;
}

export interface Transaction {
   id: string;
   project_id: string;
   category_id: string;
   category?: TransactionCategory;
   amount: string;
   currency_code: string;
   note: string | null;
   occurred_at: string;
   created_by_user_id: string;
   created_at: string;
   updated_at: string;
}

export interface TransactionListResult {
   items: Transaction[];
   pagination: Pagination;
}

export interface ProjectTotals {
   income: string;
   expense: string;
   net: string;
}

export interface Member {
   id: string;
   project_id: string;
   person_id: string;
   is_lead: boolean;
   added_by_user_id: string;
   joined_at: string;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
   id: string;
   project_id: string;
   title: string;
   description: string | null;
   status: TaskStatus;
   priority: TaskPriority;
   assigned_person_id: string | null;
   due_date: string | null; // "YYYY-MM-DD"
   created_by_user_id: string;
   created_at: string;
   updated_at: string;
}

export interface TaskListResult {
   items: Task[];
   pagination: Pagination;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export interface DashboardStatusCount {
   status: ProjectStatus;
   count: number;
}

export interface DashboardDeadlineProject {
   id: string;
   project_code: string;
   name: string;
   status: ProjectStatus;
   deadline_at: string;
}

export interface DashboardPL {
   income: string;
   expense: string;
   net: string;
}

export interface DashboardStats {
   status_counts: DashboardStatusCount[];
   upcoming_deadlines: DashboardDeadlineProject[];
   pl: DashboardPL;
}
