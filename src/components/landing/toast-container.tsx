// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/landing/colors";
import { setToastCallback } from "@/lib/landing/utils";

/* ── TOAST NOTIFICATION SYSTEM ───────────────────────────────── */
export function LandingToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    setToastCallback((msg, type = "success") => {
      const id = Date.now();
      setToasts((p) => [...p, { id, msg, type }]);
      setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
    });
    return () => { setToastCallback(null); };
  }, []);

  if (!toasts.length) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      alignItems: "center",
      pointerEvents: "none",
    }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          padding: "12px 22px",
          borderRadius: 10,
          background: t.type === "error" ? "rgba(224,90,90,.95)" : t.type === "info" ? "rgba(74,158,232,.95)" : "rgba(10,10,8,.97)",
          border: `1px solid ${t.type === "error" ? "rgba(224,90,90,.5)" : t.type === "info" ? "rgba(74,158,232,.5)" : "rgba(198,165,107,.4)"}`,
          color: t.type === "error" || t.type === "info" ? "#fff" : C.gold,
          fontSize: "0.72rem",
          fontWeight: 500,
          letterSpacing: "0.5px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 8px 32px rgba(0,0,0,.4)",
          animation: "toastIn .3s ease both",
          whiteSpace: "nowrap",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span>{t.type === "error" ? "⚠" : t.type === "info" ? "ℹ" : "✓"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
