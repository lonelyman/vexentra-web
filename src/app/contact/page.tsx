import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import "@/styles/landing.css";

export const metadata = {
   title: "ติดต่อเรา — Vexentra",
   description:
      "ช่องทางติดต่อ Vexentra สำหรับรับงานใหม่ ร่วมงาน หรือสอบถามข้อมูล",
};

const contactChannels = [
   {
      icon: (
         <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
         >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
         </svg>
      ),
      label: "อีเมล",
      value: "contact@vexentra.com",
      href: "mailto:contact@vexentra.com",
      desc: "สำหรับสอบถามเรื่องโปรเจกต์ ราคา หรือนัดหมาย",
   },
   {
      icon: (
         <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
         >
            <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .97-.31 3.18 1.18.92-.26 1.91-.39 2.89-.39.98 0 1.97.13 2.89.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.18 1.82 1.18 3.07 0 4.41-2.69 5.38-5.25 5.66.41.36.77 1.06.77 2.14 0 1.55-.01 2.79-.01 3.17 0 .31.21.67.8.56C20.21 21.39 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" />
         </svg>
      ),
      label: "GitHub",
      value: "github.com/vexentra",
      href: "https://github.com/vexentra",
      desc: "ดู source code และ open-source projects",
   },
   {
      icon: (
         <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
         >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
         </svg>
      ),
      label: "LINE / Messenger",
      value: "@vexentra",
      href: "#",
      desc: "ช่องทางด่วนสำหรับนัดหมายและสอบถามทั่วไป",
   },
];

const purposes = [
   {
      title: "รับงานใหม่",
      desc: "ต้องการระบบบริหารโปรเจกต์ หรือต้องการจ้างทีมพัฒนาซอฟต์แวร์ ติดต่อมาเพื่อรับ proposal ได้เลย",
      tag: "งาน",
   },
   {
      title: "ร่วมทีม",
      desc: "Developer หรือ Designer ที่สนใจร่วมงาน สามารถส่ง portfolio มาได้ตลอดเวลา",
      tag: "สมัครงาน",
   },
   {
      title: "ถามเรื่องระบบ",
      desc: "สงสัยเรื่องการทำงานของ Vexentra หรืออยากดู demo ระบบจริง ยินดีตอบทุกคำถาม",
      tag: "สอบถาม",
   },
];

export default function ContactPage() {
   return (
      <div className="landing">
         <PublicNavbar />

         <section className="landing-hero">
            <span className="eyebrow">CONTACT US</span>
            <h1>พูดคุยกับเรา</h1>
            <p className="tagline">
               ไม่ว่าจะมีงานใหม่ อยากร่วมทีม หรือแค่อยากถาม —
               เราพร้อมรับฟังและตอบกลับทุกข้อความ
            </p>
         </section>

         <section className="landing-features" style={{ paddingTop: 0 }}>
            <h2 className="section-title">ติดต่อเพื่ออะไรได้บ้าง</h2>
            <div className="feature-grid">
               {purposes.map((p) => (
                  <div key={p.title} className="feature-card">
                     <span className="badge">{p.tag}</span>
                     <h3>{p.title}</h3>
                     <p>{p.desc}</p>
                  </div>
               ))}
            </div>
         </section>

         <section className="landing-news">
            <h2 className="section-title">ช่องทางติดต่อ</h2>
            <div className="news-list">
               {contactChannels.map((ch) => (
                  <a
                     key={ch.label}
                     href={ch.href}
                     className="news-card contact-channel-card"
                     target={ch.href.startsWith("http") ? "_blank" : undefined}
                     rel={
                        ch.href.startsWith("http")
                           ? "noopener noreferrer"
                           : undefined
                     }
                  >
                     <div className="contact-channel-icon">{ch.icon}</div>
                     <div>
                        <div className="news-meta">
                           <span className="news-tag">{ch.label}</span>
                           <span className="news-date">{ch.value}</span>
                        </div>
                        <p className="news-desc">{ch.desc}</p>
                     </div>
                  </a>
               ))}
            </div>
         </section>

         <section className="landing-cta-bottom">
            <h2>ยังไม่แน่ใจ?</h2>
            <p>ดูผลงานและประวัติของทีมก่อนตัดสินใจ</p>
            <div className="cta-row">
               <Link href="/portfolio" className="btn-primary">
                  ดู Portfolio →
               </Link>
               <Link href="/about" className="btn-ghost">
                  เรียนรู้เพิ่มเติม
               </Link>
            </div>
         </section>

         <footer className="landing-footer">
            <span className="brand">Vexentra</span> © {new Date().getFullYear()}
         </footer>
      </div>
   );
}
