"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
   name: string;
   accept: string;
   hint?: string;
   currentImageUrl?: string | null;
   currentImageAlt?: string;
   showCurrentPreview?: boolean;
   deletePendingFieldName?: string;
   resetSignal?: number;
};

export default function FileDropzoneField({
   name,
   accept,
   hint = "ลากไฟล์มาวาง หรือคลิกเลือกไฟล์",
   currentImageUrl,
   currentImageAlt = "current image",
   showCurrentPreview = true,
   deletePendingFieldName = "avatar_delete_pending",
   resetSignal = 0,
}: Props) {
   const inputRef = useRef<HTMLInputElement | null>(null);
   const [isDragging, setIsDragging] = useState(false);
   const [selectedName, setSelectedName] = useState("");
   const [selectedPreviewUrl, setSelectedPreviewUrl] = useState("");
   const [deletePending, setDeletePending] = useState(false);
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   const [localError, setLocalError] = useState("");

   useEffect(() => {
      return () => {
         if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
      };
   }, [selectedPreviewUrl]);

   useEffect(() => {
      if (inputRef.current) inputRef.current.value = "";
      setSelectedName("");
      if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
      setSelectedPreviewUrl("");
      setDeletePending(false);
      setShowDeleteModal(false);
      setLocalError("");
   }, [resetSignal]);

   function openPicker() {
      inputRef.current?.click();
   }

   function inferMimeByFilename(filename: string): string {
      const lower = filename.trim().toLowerCase();
      if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
      if (lower.endsWith(".png")) return "image/png";
      if (lower.endsWith(".webp")) return "image/webp";
      return "";
   }

   function normalizeMime(rawMime: string, filename: string): string {
      const mime = (rawMime || "").trim().toLowerCase();
      if (mime === "image/jpg") return "image/jpeg";
      if (mime === "image/jpeg" || mime === "image/png" || mime === "image/webp") return mime;
      return inferMimeByFilename(filename);
   }

   function validateFile(file: File): string | null {
      const allowedTypes = accept
         .split(",")
         .map((x) => x.trim().toLowerCase())
         .filter(Boolean);
      const fileType = normalizeMime(file.type, file.name);
      const maxBytes = 5 * 1024 * 1024;

      if (!fileType || (allowedTypes.length > 0 && !allowedTypes.includes(fileType))) {
         return "รองรับเฉพาะไฟล์ JPEG / PNG / WEBP";
      }
      if (file.size > maxBytes) {
         return "ขนาดไฟล์เกิน 5MB";
      }
      return null;
   }

   function setSelectedFile(file: File | null) {
      setLocalError("");
      setSelectedName(file?.name || "");
      if (file) setDeletePending(false);
      if (selectedPreviewUrl) {
         URL.revokeObjectURL(selectedPreviewUrl);
      }
      if (file) {
         setSelectedPreviewUrl(URL.createObjectURL(file));
      } else {
         setSelectedPreviewUrl("");
      }
   }

   function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
      const file = e.target.files?.[0] ?? null;
      if (file) {
         const invalidMessage = validateFile(file);
         if (invalidMessage) {
            setLocalError(invalidMessage);
            if (inputRef.current) inputRef.current.value = "";
            setSelectedFile(null);
            return;
         }
      }
      setSelectedFile(file);
   }

   function onDrop(e: React.DragEvent<HTMLDivElement>) {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const input = inputRef.current;
      const droppedFiles = e.dataTransfer.files;
      const file = droppedFiles?.[0];
      if (!file || !input) return;

      const invalidMessage = validateFile(file);
      if (invalidMessage) {
         setLocalError(invalidMessage);
         return;
      }

      let assigned = false;
      try {
         input.files = droppedFiles;
         assigned = true;
      } catch {}

      if (!assigned && typeof DataTransfer !== "undefined") {
         try {
            const dt = new DataTransfer();
            dt.items.add(file);
            input.files = dt.files;
            assigned = true;
         } catch {}
      }

      if (!assigned) {
         setLocalError("เบราว์เซอร์ไม่รองรับการลากไฟล์ในฟอร์มนี้ กรุณากดปุ่มเลือกไฟล์");
         return;
      }

      input.dispatchEvent(new Event("change", { bubbles: true }));
   }

   function clearSelection() {
      if (inputRef.current) inputRef.current.value = "";
      setSelectedFile(null);
      setDeletePending(false);
      setLocalError("");
   }

   const canShowCurrentPreview = Boolean(showCurrentPreview && !deletePending && (selectedPreviewUrl || currentImageUrl));
   const canStageDelete = Boolean(currentImageUrl && !selectedPreviewUrl && !deletePending);

   return (
      <div>
         <input type="hidden" name={deletePendingFieldName} value={deletePending ? "1" : "0"} />
         <div
            className={`ws-file-dropzone${isDragging ? " is-dragging" : ""}`}
            onDragOver={(e) => {
               e.preventDefault();
               setIsDragging(true);
            }}
            onDragLeave={(e) => {
               e.preventDefault();
               setIsDragging(false);
            }}
            onDrop={onDrop}
         >
            <input
               ref={inputRef}
               name={name}
               type="file"
               accept={accept}
               className="ws-file-dropzone-input"
               onChange={onInputChange}
            />
            {canShowCurrentPreview && (
               <div className="ws-avatar-preview-wrap ws-avatar-preview-wrap--inside-dropzone">
                  <img
                     src={selectedPreviewUrl || currentImageUrl || ""}
                     alt={currentImageAlt}
                     className="ws-avatar-preview-img"
                  />
                  {canStageDelete ? (
                     <button
                        type="button"
                        className="ws-avatar-delete-icon-btn"
                        title="เตรียมลบรูปปัจจุบัน"
                        aria-label="เตรียมลบรูปปัจจุบัน"
                        onClick={() => setShowDeleteModal(true)}
                     >
                        🗑
                     </button>
                  ) : null}
               </div>
            )}
            <div className="ws-file-dropzone-title">อัปโหลดรูปโปรไฟล์</div>
            <div className="ws-file-dropzone-hint">{hint}</div>
            {deletePending ? (
               <div className="ws-file-dropzone-warning">ตั้งค่าสถานะลบรูปแล้ว ต้องกดบันทึกโปรไฟล์เพื่อยืนยัน</div>
            ) : null}
            {localError ? <div className="ws-file-dropzone-error">{localError}</div> : null}
            <button type="button" className="ws-file-dropzone-btn" onClick={openPicker}>
               เลือกไฟล์
            </button>
         </div>

         {(selectedName || deletePending) && (
            <div className="ws-file-selected-row">
               <span className="ws-file-selected-name">
                  {selectedName || "ตั้งค่าสถานะลบรูปปัจจุบันแล้ว (ยังไม่ลบจริง)"}
               </span>
               <button type="button" className="ws-file-selected-clear" onClick={clearSelection}>
                  ล้าง
               </button>
            </div>
         )}

         {showDeleteModal ? (
            <div className="ws-dropzone-modal-backdrop" role="dialog" aria-modal="true">
               <div className="ws-dropzone-modal">
                  <h4 className="ws-dropzone-modal-title">เตรียมลบรูปปัจจุบัน</h4>
                  <p className="ws-dropzone-modal-text">
                     ระบบยังไม่ลบรูปทันที ต้องกดปุ่มบันทึกโปรไฟล์ก่อนจึงจะลบจริง
                  </p>
                  <div className="ws-dropzone-modal-actions">
                     <button
                        type="button"
                        className="ws-btn-ghost"
                        onClick={() => setShowDeleteModal(false)}
                     >
                        ยกเลิก
                     </button>
                     <button
                        type="button"
                        className="ws-btn-ghost-danger"
                        onClick={() => {
                           setDeletePending(true);
                           setShowDeleteModal(false);
                        }}
                     >
                        ตกลง
                     </button>
                  </div>
               </div>
            </div>
         ) : null}
      </div>
   );
}
