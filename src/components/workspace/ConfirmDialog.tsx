"use client";

type ConfirmDialogProps = {
   open: boolean;
   title: string;
   message: string;
   confirmLabel?: string;
   cancelLabel?: string;
   confirming?: boolean;
   onConfirm?: () => void;
   onCancel: () => void;
   singleAction?: boolean;
};

export default function ConfirmDialog({
   open,
   title,
   message,
   confirmLabel = "ยืนยัน",
   cancelLabel = "ยกเลิก",
   confirming = false,
   onConfirm,
   onCancel,
   singleAction = false,
}: ConfirmDialogProps) {
   if (!open) return null;

   return (
      <div className="ws-dialog-backdrop open" role="dialog" aria-modal="true">
         <div className="ws-dialog ws-confirm-dialog">
            <div className="ws-dialog-title">{title}</div>
            <p className="ws-confirm-dialog-message">{message}</p>
            <div className="ws-dialog-actions">
               {singleAction ? (
                  <button type="button" className="ws-btn-primary" onClick={onCancel} disabled={confirming}>
                     {confirmLabel}
                  </button>
               ) : (
                  <>
                     <button type="button" className="ws-btn-ghost" onClick={onCancel} disabled={confirming}>
                        {cancelLabel}
                     </button>
                     <button
                        type="button"
                        className="ws-btn-ghost-danger"
                        onClick={onConfirm}
                        disabled={confirming}
                     >
                        {confirming ? "กำลังดำเนินการ..." : confirmLabel}
                     </button>
                  </>
               )}
            </div>
         </div>
      </div>
   );
}
