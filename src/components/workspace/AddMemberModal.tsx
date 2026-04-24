"use client";

import { useRef, useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { addMemberAction } from "@/app/actions/members";

type ActionState = { error?: string; success?: boolean };
const init: ActionState = {};

export interface MemberPickerOption {
   person_id: string;
   username: string;
   email: string;
   display_name: string;
   headline: string;
   avatar_url: string;
}

interface Props {
   projectId: string;
   initialCandidates: MemberPickerOption[];
   initialNextCursor: string | null;
   initialHasMore: boolean;
   existingPersonIds: string[];
}

export default function AddMemberModal({
   projectId,
   initialCandidates,
   initialNextCursor,
   initialHasMore,
   existingPersonIds,
}: Props) {
   const router = useRouter();
   const backdropRef = useRef<HTMLDivElement>(null);
   const [state, action, pending] = useActionState(addMemberAction, init);
   const [query, setQuery] = useState("");
   const [selectedPersonId, setSelectedPersonId] = useState("");
   const [items, setItems] = useState<MemberPickerOption[]>(initialCandidates);
   const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
   const [hasMore, setHasMore] = useState(initialHasMore);
   const [isLoading, setIsLoading] = useState(false);

   async function loadCandidates(opts?: { cursor?: string; search?: string; replace?: boolean }) {
      setIsLoading(true);
      try {
         const sp = new URLSearchParams();
         sp.set("limit", "20");
         if (opts?.cursor !== undefined && opts.cursor !== null) {
            sp.set("cursor", opts.cursor);
         }
         const q = (opts?.search ?? query).trim();
         if (q) sp.set("search", q);
         const res = await fetch(`/api/member-candidates?${sp.toString()}`, {
            method: "GET",
            cache: "no-store",
         });
         const body = await res.json().catch(() => ({}));
         if (!res.ok) return;

         const nextItems: MemberPickerOption[] = body?.data?.items ?? [];
         const pagination = body?.data?.pagination ?? {};
         setItems((prev) => {
            if (opts?.replace) return nextItems;
            return [...prev, ...nextItems];
         });
         setNextCursor((pagination?.next_cursor as string | null) ?? null);
         setHasMore(Boolean(pagination?.has_more));
      } finally {
         setIsLoading(false);
      }
   }

   useEffect(() => {
      const tid = setTimeout(() => {
         const q = query.trim();
         if (!q) {
            setItems(initialCandidates);
            setNextCursor(initialNextCursor);
            setHasMore(initialHasMore);
            return;
         }
         setSelectedPersonId("");
         void loadCandidates({ cursor: "", search: q, replace: true });
      }, 250);
      return () => clearTimeout(tid);
   }, [query, initialCandidates, initialHasMore, initialNextCursor]);

   const selectableCandidates = useMemo(
      () =>
         items.filter(
            (c) => !existingPersonIds.includes(c.person_id),
         ),
      [items, existingPersonIds],
   );

   const filteredCandidates = selectableCandidates;

   useEffect(() => {
      if (state.success) {
         backdropRef.current?.classList.remove("open");
         setSelectedPersonId("");
         setQuery("");
         router.refresh();
      }
   }, [state.success, router]);

   const open = () => {
      setSelectedPersonId("");
      setQuery("");
      backdropRef.current?.classList.add("open");
      void loadCandidates({ cursor: "", search: "", replace: true });
   };
   const close = () => {
      backdropRef.current?.classList.remove("open");
      setSelectedPersonId("");
      setQuery("");
   };

   const selectedPerson = selectableCandidates.find(
      (c) => c.person_id === selectedPersonId,
   );

   return (
      <>
         <button className="ws-btn-primary" onClick={open}>
            + เพิ่มสมาชิก
         </button>

         <div ref={backdropRef} className="ws-dialog-backdrop">
            <div className="ws-dialog">
               <div className="ws-dialog-title">เพิ่มสมาชิกเข้าโปรเจกต์</div>

               {state.error && (
                  <div className="ws-form-error">{state.error}</div>
               )}

               <form action={action}>
                  <input type="hidden" name="project_id" value={projectId} />
                  <input type="hidden" name="person_id" value={selectedPersonId} />

                  <div className="ws-form-group">
                     <label className="ws-form-label">ค้นหาสมาชิก</label>
                     <input
                        type="text"
                        placeholder="ค้นหาจากชื่อ ตำแหน่ง username หรืออีเมล"
                        className="ws-form-input"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                     />
                     <div className="ws-member-picker-list">
                        {filteredCandidates.length === 0 ? (
                           <div className="ws-member-picker-empty">
                              {isLoading ? "กำลังค้นหา..." : "ไม่พบสมาชิกที่ตรงคำค้น"}
                           </div>
                        ) : (
                           filteredCandidates.map((c) => {
                              const isSelected = selectedPersonId === c.person_id;
                              const initial = (c.display_name || c.username || "?")
                                 .slice(0, 1)
                                 .toUpperCase();
                              return (
                                 <button
                                    key={c.person_id}
                                    type="button"
                                    className={`ws-member-picker-row${isSelected ? " selected" : ""}`}
                                    onClick={() => setSelectedPersonId(c.person_id)}
                                 >
                                    <div className="ws-member-avatar">
                                       {c.avatar_url ? (
                                          <img
                                             src={c.avatar_url}
                                             alt={c.display_name || c.username}
                                             className="ws-member-avatar-img"
                                          />
                                       ) : (
                                          initial
                                       )}
                                    </div>
                                    <div className="ws-member-picker-main">
                                       <div className="ws-member-picker-name">
                                          {c.display_name || c.username}
                                       </div>
                                       <div className="ws-member-picker-meta">
                                          @{c.username} · {c.email}
                                       </div>
                                       {c.headline ? (
                                          <div className="ws-member-picker-headline">
                                             {c.headline}
                                          </div>
                                       ) : null}
                                    </div>
                                 </button>
                              );
                           })
                        )}
                     </div>
                     {hasMore ? (
                        <div className="ws-member-picker-controls">
                           <button
                              type="button"
                              className="ws-member-picker-load-more"
                              disabled={isLoading}
                              aria-label="โหลดสมาชิกเพิ่ม"
                              title="โหลดเพิ่ม"
                              onClick={() => {
                                 if (!hasMore || isLoading) return;
                                 void loadCandidates({ cursor: nextCursor ?? "", search: query, replace: false });
                              }}
                           >
                              {isLoading ? (
                                 <span className="ws-member-picker-load-more-spinner" aria-hidden="true">
                                    …
                                 </span>
                              ) : (
                                 <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                 >
                                    <path d="M7 10l5 5 5-5" />
                                 </svg>
                              )}
                              <span>{isLoading ? "กำลังโหลด" : "โหลดเพิ่ม"}</span>
                           </button>
                        </div>
                     ) : null}
                     {selectedPerson ? (
                        <p style={{ fontSize: 12, color: "var(--text-dim)", marginTop: 8 }}>
                           เลือกแล้ว: {selectedPerson.display_name || selectedPerson.username}
                        </p>
                     ) : null}
                  </div>

                  <div className="ws-dialog-actions">
                     <button type="button" className="ws-btn-ghost" onClick={close}>
                        ยกเลิก
                     </button>
                     <button
                        type="submit"
                        className="ws-btn-primary"
                        disabled={pending || !selectedPersonId}
                     >
                        {pending ? "กำลังเพิ่ม..." : "เพิ่มสมาชิก"}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </>
   );
}
