import { Profile, SocialPlatform } from "@/lib/api";

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
                              {platform?.icon_url ? (
                                 <img
                                    src={platform.icon_url}
                                    alt={platform.name}
                                    width={20}
                                    height={20}
                                 />
                              ) : (
                                 "🔗"
                              )}
                           </a>
                        );
                     })}
               </div>
            </div>

            <div className="hero-avatar-wrap">
               {profile.avatar_url ? (
                  <img
                     src={profile.avatar_url}
                     alt={profile.display_name}
                     className="hero-avatar"
                  />
               ) : (
                  <div className="hero-avatar">👤</div>
               )}
            </div>
         </div>
      </section>
   );
}
