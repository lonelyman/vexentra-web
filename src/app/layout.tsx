import type { Metadata } from "next";
import { Inter, Sarabun } from "next/font/google";
import "./globals.css";

const inter = Inter({
   variable: "--font-inter",
   subsets: ["latin"],
});

const sarabun = Sarabun({
   variable: "--font-sarabun",
   weight: ["300", "400", "500", "600", "700"],
   subsets: ["thai", "latin"],
});

export const metadata: Metadata = {
   title: "นิพนธ์ คนสันเทียะ — Portfolio",
   description: "Senior Full-Stack Developer Portfolio",
};

export default function RootLayout({
   children,
}: Readonly<{
   children: React.ReactNode;
}>) {
   return (
      <html
         lang="th"
         className={`${inter.variable} ${sarabun.variable} h-full antialiased`}
      >
         <body className="min-h-full flex flex-col">{children}</body>
      </html>
   );
}
