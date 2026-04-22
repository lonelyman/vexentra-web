import Link from "next/link";
import { cookies } from "next/headers";

export default async function PublicNavbar() {
   const token = (await cookies()).get("token")?.value;
   const refreshToken = (await cookies()).get("refresh_token")?.value;
   const isLoggedIn = !!(token || refreshToken);

   return (
      <nav className="public-nav">
         <Link href="/" className="nav-brand">
            Vexentra<span className="dot">.</span>
         </Link>
         <ul className="nav-links">
            <li>
               <Link href="/">หน้าแรก</Link>
            </li>
            <li>
               <Link href="/about">Vexentra คืออะไร</Link>
            </li>
            <li>
               <Link href="/portfolio">Portfolio</Link>
            </li>
            <li>
               <Link href="/contact">ติดต่อเรา</Link>
            </li>
            <li>
               {isLoggedIn ? (
                  <Link href="/workspace">Workspace →</Link>
               ) : (
                  <Link href="/login">เข้าสู่ระบบ</Link>
               )}
            </li>
         </ul>
      </nav>
   );
}
