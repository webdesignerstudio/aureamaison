import Link from "next/link";
import { C } from "@/lib/landing/colors";

export default function NotFoundPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, padding: "0 20px", textAlign: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "5rem", fontWeight: 300, color: C.gold, lineHeight: 1, marginBottom: 16 }}>404</div>
      <p style={{ fontSize: "0.72rem", color: C.muted, marginBottom: 28 }}>Deze pagina bestaat niet.</p>
      <Link href="/dashboard" style={{ display: "inline-block", padding: "10px 22px", borderRadius: 8, background: C.gold, color: "#0a0a08", fontSize: "0.72rem", fontWeight: 700, letterSpacing: 0.5, textDecoration: "none" }}>
        Naar dashboard
      </Link>
    </div>
  );
}
