import { Profile, SocialPlatform } from "@/lib/api";

function PlatformIcon({ platformKey }: { platformKey?: string }) {
   const common = {
      width: 28,
      height: 28,
      viewBox: "0 0 24 24",
      "aria-hidden": true,
   };
   switch (platformKey) {
      case "github":
         return (
            <svg {...common} fill="currentColor">
               <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.66.41.36.77 1.06.77 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" />
            </svg>
         );
      case "facebook":
         return (
            <svg {...common} fill="currentColor">
               <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.23 2.69.23v2.97h-1.52c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
            </svg>
         );
      default:
         return (
            <svg
               {...common}
               fill="none"
               stroke="currentColor"
               strokeWidth="2"
               strokeLinecap="round"
               strokeLinejoin="round"
            >
               <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
               <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
         );
   }
}

export default function ContactSection({
   profile,
   platforms = [],
}: {
   profile: Profile;
   platforms?: SocialPlatform[];
}) {
   return (
      <section id="contact">
         <div className="contact-inner">
            <div
               className="section-label"
               style={{ justifyContent: "center", display: "flex" }}
            >
               ติดต่อ
            </div>
            <h2 className="contact-headline">
               ช่องทาง
               <br />
               <span className="grad">การติดต่อ</span>
            </h2>
            <p className="contact-sub">
               ยินดีที่ได้รู้จักครับ! สามารถติดต่อเพื่อแลกเปลี่ยนความคิดเห็น
               พูดคุยเรื่องเทคโนโลยี
               และการพัฒนาซอฟต์แวร์ได้ตามช่องทางด้านล่างนี้ครับ
            </p>

            <div className="contact-cards">
               {profile.social_links?.map((link) => {
                  const platform = platforms.find(
                     (p) => p.id === link.platform_id,
                  );
                  let hostname = link.url;
                  try {
                     hostname = new URL(link.url).hostname.replace(/^www\./, "");
                  } catch {
                     // ignore
                  }
                  return (
                     <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`contact-card platform-${platform?.key ?? "generic"}`}
                     >
                        <div className="contact-card-icon">
                           <PlatformIcon platformKey={platform?.key} />
                        </div>
                        <div className="contact-card-label">
                           {platform?.name ?? "ลิงก์"}
                        </div>
                        <div className="contact-card-value">{hostname}</div>
                     </a>
                  );
               })}
            </div>
         </div>
      </section>
   );
}
