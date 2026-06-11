"use client";

import { C } from "@/lib/landing/colors";

export function LLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
      <div style={{ width: 26, height: 1, background: C.gold }} />
      <span style={{ fontSize: "0.58rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase" }}>
        {children}
      </span>
    </div>
  );
}
