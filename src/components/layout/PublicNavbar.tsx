import Link from "next/link";

export default function PublicNavbar() {
   return (
      <nav className="public-nav">
         <Link href="/" className="nav-brand">
            Vexentra<span className="dot">.</span>
         </Link>
         <ul className="nav-links">
            <li>
               <Link href="/">หน้าหลัก</Link>
            </li>
            <li>
               <Link href="/portfolio">Portfolio</Link>
            </li>
            <li>
               <Link href="/login">เข้าสู่ระบบ</Link>
            </li>
         </ul>
      </nav>
   );
}
