"use client";

export const DEFAULT_LIMIT = 20;
const LIMIT_OPTIONS = [10, 20, 50, 100, 200, 500];

interface LimitSelectProps {
   limit: number;
   basePath: string;
   extraParams?: Record<string, string>;
}

export default function LimitSelect({ limit, basePath, extraParams = {} }: LimitSelectProps) {
   function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(extraParams)) {
         if (value) params.set(key, value);
      }
      const newLimit = Number(e.target.value);
      if (newLimit !== DEFAULT_LIMIT) params.set("limit", String(newLimit));
      const qs = params.toString();
      window.location.href = `${basePath}${qs ? `?${qs}` : ""}`;
   }

   return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
         <label style={{ fontSize: 13, color: "var(--text-dim)" }}>แสดง</label>
         <select
            defaultValue={String(limit)}
            className="ws-filter-select"
            onChange={handleChange}
         >
            {LIMIT_OPTIONS.map((n) => (
               <option key={n} value={n}>{n}</option>
            ))}
         </select>
         <span style={{ fontSize: 13, color: "var(--text-dim)" }}>รายการ/หน้า</span>
      </div>
   );
}
