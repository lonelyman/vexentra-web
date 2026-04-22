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

export interface UserMe {
   id: string;
   person_id: string;
   username: string;
   email: string;
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

export interface Project {
   id: string;
   project_code: string;
   name: string;
   description: string | null;
   status: ProjectStatus;
   client_person_id: string | null;
   client_name_raw: string | null;
   scheduled_start_at: string | null;
   deadline_at: string | null;
   activated_at: string | null;
   closed_at: string | null;
   closure_reason: string | null;
   created_by_user_id: string;
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
