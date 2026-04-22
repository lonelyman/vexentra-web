import { Profile, SocialPlatform } from "@/lib/api";

function isValidImageUrl(url?: string | null): url is string {
   if (!url) return false;
   try {
      const u = new URL(url);
      return (
         u.protocol === "http:" ||
         u.protocol === "https:" ||
         u.protocol === "data:"
      );
   } catch {
      return false;
   }
}

function AvatarFallback({ label }: { label: string }) {
   return (
      <div className="hero-avatar hero-avatar-fallback" aria-label={label}>
         <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
         >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
         </svg>
      </div>
   );
}

export default function HeroSection({
   profile,
   platforms = [],
}: {
   profile: Profile;
   platforms?: SocialPlatform[];
}) {
   // Extract parts of display_name (e.g. "สมชาย" and "วงษ์สวรรค์")
   const parts = profile.display_name.split(" ");
   const firstName = parts[0] || "";
   const lastName = parts.slice(1).join(" ");

   return (
      <section id="hero">
         <div className="hero-inner">
            <div>
               <h1 className="hero-name">
                  {firstName}
                  <br />
                  {lastName && <span className="highlight">{lastName}</span>}
               </h1>
               <p className="hero-headline">{profile.headline}</p>
               <p className="hero-bio">{profile.bio}</p>
               <div className="hero-meta">
                  <div className="hero-meta-item">
                     <span className="icon">📍</span> {profile.location}
                  </div>
                  <div className="hero-meta-item">
                     <span className="icon">💻</span> Programmer
                  </div>
               </div>
               <div className="hero-actions">
                  <a href="#portfolio" className="btn-primary">
                     ดูผลงาน →
                  </a>
                  <a href="#contact" className="btn-ghost">
                     ติดต่อฉัน
                  </a>
               </div>
               <div className="social-links">
                  {profile.social_links &&
                     profile.social_links.map((link) => {
                        const platform = platforms.find(
                           (p) => p.id === link.platform_id,
                        );
                        return (
                           <a
                              key={link.id}
                              href={link.url}
                              className="social-link"
                              target="_blank"
                              rel="noreferrer"
                              aria-label={platform?.name ?? "Social link"}
                           >
                              {isValidImageUrl(platform?.icon_url) ? (
                                 <img
                                    src={platform.icon_url!}
                                    alt={platform?.name ?? ""}
                                    width={20}
                                    height={20}
                                 />
                              ) : (
                                 <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                                 >
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                 </svg>
                              )}
                           </a>
                        );
                     })}
               </div>
            </div>

            <div className="hero-avatar-wrap">
               {isValidImageUrl(profile.avatar_url) ? (
                  <img
                     src={profile.avatar_url}
                     alt={profile.display_name}
                     className="hero-avatar"
                  />
               ) : (
                  <AvatarFallback label={profile.display_name} />
               )}
            </div>
         </div>
      </section>
   );
}
