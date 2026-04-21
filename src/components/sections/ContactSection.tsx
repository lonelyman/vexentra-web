import { Profile, SocialPlatform } from "@/lib/api";

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
                  let hostname = link.url;
                  try {
                     hostname = new URL(link.url).hostname;
                  } catch {
                     // URL ไม่ถูกต้อง — แสดง raw url แทน
                  }
                  return (
                     <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="contact-card"
                     >
                        <div className="contact-card-icon">🔗</div>
                        <div className="contact-card-label">Social</div>
                        <div className="contact-card-value">{hostname}</div>
                     </a>
                  );
               })}
            </div>
         </div>
      </section>
   );
}
