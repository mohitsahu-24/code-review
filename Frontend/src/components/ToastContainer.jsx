import React from "react";
import { Check, AlertCircle, Info } from "lucide-react";

export default function ToastContainer({ toasts }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-[99999] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl text-xs font-semibold text-white pointer-events-auto transition-all duration-300 min-w-[240px] max-w-[320px] ${
            t.type === "success"
              ? "bg-emerald-600 shadow-emerald-950/20"
              : t.type === "error"
              ? "bg-rose-600 shadow-rose-950/20"
              : "bg-indigo-600 shadow-indigo-950/20"
          }`}
        >
          {t.type === "success" && <Check size={15} className="flex-shrink-0" />}
          {t.type === "error" && <AlertCircle size={15} className="flex-shrink-0" />}
          {t.type === "info" && <Info size={15} className="flex-shrink-0" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
