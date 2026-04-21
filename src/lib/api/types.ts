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
