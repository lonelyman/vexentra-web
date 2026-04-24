"use client";

import { useState } from "react";

export default function CopyPortfolioLinkButton({ path }: { path: string }) {
   const [copied, setCopied] = useState(false);

   async function handleCopy() {
      try {
         const fullUrl =
            typeof window !== "undefined"
               ? `${window.location.origin}${path}`
               : path;
         await navigator.clipboard.writeText(fullUrl);
         setCopied(true);
         setTimeout(() => setCopied(false), 1500);
      } catch {
         setCopied(false);
      }
   }

   return (
      <button type="button" onClick={handleCopy} className="ws-btn-ghost">
         {copied ? "คัดลอกแล้ว" : "คัดลอกลิงก์แชร์"}
      </button>
   );
}
