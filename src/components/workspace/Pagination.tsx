import Link from "next/link";
import LimitSelect, { DEFAULT_LIMIT } from "./LimitSelect";

interface PaginationProps {
   page: number;
   limit: number;
   totalPages: number;
   totalRecords: number;
   unit: string;
   basePath: string;
   extraParams?: Record<string, string>;
}

function url(basePath: string, page: number, limit: number, extraParams: Record<string, string>) {
   const p = new URLSearchParams();
   for (const [k, v] of Object.entries(extraParams)) {
      if (v) p.set(k, v);
   }
   if (limit !== DEFAULT_LIMIT) p.set("limit", String(limit));
   if (page > 1) p.set("page", String(page));
   const qs = p.toString();
   return `${basePath}${qs ? `?${qs}` : ""}`;
}

export default function Pagination({
   page,
   limit,
   totalPages,
   totalRecords,
   unit,
   basePath,
   extraParams = {},
}: PaginationProps) {
   return (
      <div className="ws-pagination">
         <LimitSelect limit={limit} basePath={basePath} extraParams={extraParams} />
         <span>
            {totalRecords} {unit} · หน้า {page} / {totalPages}
         </span>
         <div className="ws-pagination-links">
            <Link
               href={url(basePath, page - 1, limit, extraParams)}
               className="ws-pagination-link"
               aria-disabled={page <= 1 ? "true" : undefined}
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                  <path fillRule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
               </svg>
            </Link>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
               <Link
                  key={p}
                  href={url(basePath, p, limit, extraParams)}
                  className="ws-pagination-link"
                  style={p === page ? { background: "var(--accent)", color: "#fff", borderColor: "var(--accent)" } : undefined}
               >
                  {p}
               </Link>
            ))}
            <Link
               href={url(basePath, page + 1, limit, extraParams)}
               className="ws-pagination-link"
               aria-disabled={page >= totalPages ? "true" : undefined}
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                  <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
               </svg>
            </Link>
         </div>
      </div>
   );
}
