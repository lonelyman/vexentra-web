import Link from "next/link";
import PublicNavbar from "@/components/layout/PublicNavbar";
import "@/styles/landing.css";

export const metadata = {
   title: "Vexentra — Project & Work Management",
   description:
      "แพลตฟอร์มบริหารโปรเจกต์สำหรับคนรับงาน ทีมเล็ก และฟรีแลนซ์ รวมทุกเรื่องของโปรเจกต์ไว้ในที่เดียว",
};

type FeatureIconProps = { children: React.ReactNode };
const FeatureIcon = ({ children }: FeatureIconProps) => (
   <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
   >
      {children}
   </svg>
);

const features = [
   {
      icon: (
         <FeatureIcon>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
         </FeatureIcon>
      ),
      title: "Project Intake",
      desc: "บันทึกงานที่รับเข้ามา ชื่อลูกค้า deadline รายละเอียด มูลค่างาน ครบในที่เดียว",
      soon: false,
   },
   {
      icon: (
         <FeatureIcon>
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
         </FeatureIcon>
      ),
      title: "Team & Roles",
      desc: "จัดการสมาชิกในโปรเจกต์ กำหนดบทบาทของแต่ละคนให้ชัดเจน",
      soon: true,
   },
   {
      icon: (
         <FeatureIcon>
            <polyline points="20 6 9 17 4 12" />
         </FeatureIcon>
      ),
      title: "Tasks & Progress",
      desc: "มอบหมายงานย่อย ติดตามความคืบหน้า ดูว่าเป็นไปตามแผนไหม",
      soon: true,
   },
   {
      icon: (
         <FeatureIcon>
            <path d="M12 19l7-7 3 3-7 7-3-3z" />
            <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
            <path d="M2 2l7.586 7.586" />
            <circle cx="11" cy="11" r="2" />
         </FeatureIcon>
      ),
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
