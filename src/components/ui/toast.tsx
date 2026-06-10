"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, type, onDismiss, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [onDismiss, duration]);

  return (
    <div
      className={cn(
        "pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-3 text-sm shadow-lg backdrop-blur-sm",
        type === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        type === "error" && "border-red-500/20 bg-red-500/10 text-red-400",
        type === "info" && "border-gold/20 bg-gold/10 text-gold"
      )}
    >
      <span>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-auto text-xs opacity-60 hover:opacity-100"
        aria-label="Sluiten"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
