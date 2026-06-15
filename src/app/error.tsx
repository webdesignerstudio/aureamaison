"use client";

import { useEffect } from "react";
import Link from "next/link";
import { C } from "@/lib/landing/colors";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, padding: "0 20px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2.5rem", fontWeight: 300, color: C.gold, marginBottom: 12 }}>Oeps!</div>
      <p style={{ fontSize: "0.72rem", color: C.muted, marginBottom: 28, maxWidth: 360, lineHeight: 1.7 }}>
        Er is iets misgegaan. Probeer de pagina te vernieuwen of ga terug naar het dashboard.
      </p>
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={reset} style={{ padding: "9px 20px", borderRadius: 8, background: C.gold, color: "#0a0a08", fontSize: "0.72rem", fontWeight: 700, border: "none", cursor: "pointer" }}>
          Opnieuw proberen
        </button>
        <Link href="/dashboard" style={{ display: "inline-block", padding: "9px 20px", borderRadius: 8, border: `1px solid ${C.bdr}`, color: C.gold, fontSize: "0.72rem", textDecoration: "none" }}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
