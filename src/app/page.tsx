import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import "@/styles/landing.css";

export const metadata = {
   title: "Vexentra — Project & Work Management",
   description:
      "แพลตฟอร์มบริหารโปรเจกต์สำหรับคนรับงาน ทีมเล็ก และฟรีแลนซ์ รวมทุกเรื่องของโปรเจกต์ไว้ในที่เดียว",
};

const features = [
   {
      icon: "📥",
      title: "Project Intake",
      desc: "บันทึกงานที่รับเข้ามา ชื่อลูกค้า deadline รายละเอียด มูลค่างาน ครบในที่เดียว",
      soon: false,
   },
   {
      icon: "👥",
      title: "Team & Roles",
      desc: "จัดการสมาชิกในโปรเจกต์ กำหนดบทบาทของแต่ละคนให้ชัดเจน",
      soon: true,
   },
   {
      icon: "✅",
      title: "Tasks & Progress",
      desc: "มอบหมายงานย่อย ติดตามความคืบหน้า ดูว่าเป็นไปตามแผนไหม",
      soon: true,
   },
   {
      icon: "🎨",
      title: "Portfolio",
      desc: "เมื่อโปรเจกต์จบ กลายเป็นผลงานในโปรไฟล์ได้ทันที ไม่ต้องเขียนซ้ำ",
      soon: false,
   },
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
               <Link href="/portfolio" className="btn-primary">
                  ดู Portfolio ผู้สร้าง →
               </Link>
               <Link href="/login" className="btn-ghost">
                  เข้าสู่ระบบ
               </Link>
            </div>
         </section>

         <section className="landing-about">
            <h2>Vexentra คืออะไร</h2>
            <p>
               เวลารับงานเข้ามา รายละเอียดกระจายอยู่หลายที่ — chat, Drive,
               กระดาษ, หัวของเราเอง Vexentra รวมทุกอย่างของโปรเจกต์ไว้ที่เดียว
               ตั้งแต่รับงานเข้า จนถึงส่งมอบและเก็บเป็นผลงาน
            </p>
         </section>

         <section className="landing-features">
            <h2 className="section-title">สิ่งที่ Vexentra ทำได้</h2>
            <p className="section-sub">
               ฟีเจอร์หลักของแพลตฟอร์ม (บางส่วนกำลังพัฒนา)
            </p>
            <div className="feature-grid">
               {features.map((f) => (
                  <div key={f.title} className="feature-card">
                     {f.soon && <span className="badge">เร็ว ๆ นี้</span>}
                     <span className="icon">{f.icon}</span>
                     <h3>{f.title}</h3>
                     <p>{f.desc}</p>
                  </div>
               ))}
            </div>
         </section>

         <footer className="landing-footer">
            <span className="brand">Vexentra</span> © {new Date().getFullYear()}
         </footer>
      </div>
   );
}
