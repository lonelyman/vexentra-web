import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import "@/styles/landing.css";

export const metadata = {
   title: "Vexentra — Project & Work Management",
   description:
      "แพลตฟอร์มบริหารโปรเจกต์สำหรับคนรับงาน ทีมเล็ก และฟรีแลนซ์ รวมทุกเรื่องของโปรเจกต์ไว้ในที่เดียว",
};

const announcements = [
   {
      date: "เม.ย. 2569",
      tag: "อัปเดต",
      title: "เปิดตัว Transaction & Finance Module",
      desc: "รองรับการบันทึกรายรับ-รายจ่ายต่อโปรเจกต์ พร้อม export CSV สำหรับทำบัญชี",
   },
   {
      date: "เม.ย. 2569",
      tag: "ฟีเจอร์ใหม่",
      title: "Project Member Management",
      desc: "เพิ่มระบบจัดการสมาชิกในโปรเจกต์ รองรับ role-based access และ project lead",
   },
   {
      date: "เม.ย. 2569",
      tag: "โครงสร้าง",
      title: "Clean Architecture + PostgreSQL 18",
      desc: "ระบบ backend ออกแบบด้วย Clean Architecture พร้อม SQL migrations ที่ production-ready",
   },
];

const milestones = [
   { value: "3+", label: "Modules พร้อมใช้งาน" },
   { value: "100%", label: "API Coverage" },
   { value: "JWT", label: "Auth ระดับองค์กร" },
   { value: "Docker", label: "Deploy-ready" },
];

export default function LandingPage() {
   return (
      <div className="landing">
         <PublicNavbar />

         <section className="landing-hero">
            <span className="eyebrow">PROJECT & WORK MANAGEMENT</span>
            <h1>ยินดีต้อนรับสู่ Vexentra</h1>
            <p className="tagline">
               แพลตฟอร์มบริหารโปรเจกต์สำหรับคนรับงาน ทีมเล็ก และฟรีแลนซ์ —
               รวมรายละเอียดงาน ทีม ความคืบหน้า และผลงาน ไว้ในที่เดียว
            </p>
            <div className="cta-row">
               <Link href="/about" className="btn-primary">
                  Vexentra คืออะไร →
               </Link>
               <Link href="/portfolio" className="btn-ghost">
                  ดู Portfolio
               </Link>
            </div>
         </section>

         <section className="landing-milestones">
            <div className="milestone-grid">
               {milestones.map((m) => (
                  <div key={m.label} className="milestone-card">
                     <span className="milestone-value">{m.value}</span>
                     <span className="milestone-label">{m.label}</span>
                  </div>
               ))}
            </div>
         </section>

         <section className="landing-news">
            <h2 className="section-title">ความเคลื่อนไหวล่าสุด</h2>
            <p className="section-sub">
               อัปเดต ฟีเจอร์ใหม่ และความก้าวหน้าของแพลตฟอร์ม
            </p>
            <div className="news-list">
               {announcements.map((a) => (
                  <article key={a.title} className="news-card">
                     <div className="news-meta">
                        <span className="news-tag">{a.tag}</span>
                        <span className="news-date">{a.date}</span>
                     </div>
                     <h3 className="news-title">{a.title}</h3>
                     <p className="news-desc">{a.desc}</p>
                  </article>
               ))}
            </div>
         </section>

         <section className="landing-cta-bottom">
            <h2>พร้อมเริ่มต้นหรือยัง?</h2>
            <p>ดูรายละเอียดระบบหรือติดต่อเราเพื่อเริ่มใช้งาน</p>
            <div className="cta-row">
               <Link href="/about" className="btn-primary">
                  ดูรายละเอียดระบบ
               </Link>
               <Link href="/contact" className="btn-ghost">
                  ติดต่อเรา
               </Link>
            </div>
         </section>

         <footer className="landing-footer">
            <span className="brand">Vexentra</span> © {new Date().getFullYear()}
         </footer>
      </div>
   );
}
