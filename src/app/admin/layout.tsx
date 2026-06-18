"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { C } from "@/lib/landing/colors";

const ADMIN_NAV = [
  { id: "overview", icon: "📊", label: "Overview" },
  { id: "companies", icon: "🏢", label: "Companies" },
  { id: "users", icon: "👥", label: "Users" },
  { id: "orders", icon: "📋", label: "Orders" },
  { id: "payments", icon: "💳", label: "Payments" },
  { id: "invoices", icon: "🧾", label: "Invoices" },
  { id: "finance", icon: "💰", label: "Finance" },
  { id: "notifications", icon: "🔔", label: "Notifications" },
  { id: "livefeed", icon: "📡", label: "Live Feed" },
  { id: "audit", icon: "📝", label: "Audit" },
  { id: "settings", icon: "⚙️", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState("overview");
  const [mobile, setMobile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "superadmin")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleResize = () => setMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", background: "#040a14", color: "#94a3b8" }}>
        Laden…
      </div>
    );
  }

  if (!user || user.role !== "superadmin") {
    return null;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#040a14", color: "#f1f5f9" }}>
      {/* Sidebar */}
      {!mobile && (
        <div style={{ width: 200, background: "#080e1a", borderRight: "1px solid #0f172a", padding: "20px 0", overflowY: "auto" }}>
          <div style={{ padding: "0 16px", marginBottom: 24 }}>
            <div style={{ fontSize: "0.5rem", letterSpacing: 2, color: "#22d3ee", textTransform: "uppercase", marginBottom: 4 }}>Admin</div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "1.4rem", fontWeight: 300, margin: 0, color: "#f1f5f9" }}>
              Control Center
            </h1>
          </div>

          {ADMIN_NAV.map((item) => (
            <Link
              key={item.id}
              href={`/admin/${item.id === "overview" ? "" : item.id}`}
              onClick={() => setActive(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                color: active === item.id ? "#22d3ee" : "#94a3b8",
                textDecoration: "none",
                fontSize: "0.72rem",
                fontWeight: 600,
                borderLeft: active === item.id ? `3px solid #22d3ee` : "3px solid transparent",
                background: active === item.id ? "rgba(34,211,238,.05)" : "transparent",
                transition: "all .2s",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}

          <div style={{ padding: "0 16px", marginTop: 24, borderTop: "1px solid #0f172a", paddingTop: 16 }}>
            <button
              onClick={() => {
                // Logout logic
                window.location.href = "/login";
              }}
              style={{
                width: "100%",
                padding: "10px",
                background: "rgba(248,113,113,.1)",
                border: "1px solid rgba(248,113,113,.3)",
                color: "#f87171",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              ← Uitloggen
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {mobile && (
          <div style={{ padding: "16px", background: "#080e1a", borderBottom: "1px solid #0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "#f1f5f9" }}>Admin</div>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.2rem" }}
            >
              ☰
            </button>
          </div>
        )}

        {mobile && menuOpen && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.65)", zIndex: 40, backdropFilter: "blur(2px)" }} onClick={() => setMenuOpen(false)} />
        )}

        {mobile && menuOpen && (
          <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#080e1a", borderTop: "1px solid #0f172a", borderRadius: "16px 16px 0 0", padding: "20px 16px", zIndex: 50 }}>
            <div style={{ width: 36, height: 4, background: "#1e293b", borderRadius: 2, margin: "0 auto 20px" }} />
            {ADMIN_NAV.map((item) => (
              <Link
                key={item.id}
                href={`/admin/${item.id === "overview" ? "" : item.id}`}
                onClick={() => {
                  setActive(item.id);
                  setMenuOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  color: active === item.id ? "#22d3ee" : "#94a3b8",
                  textDecoration: "none",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                window.location.href = "/login";
              }}
              style={{
                marginTop: 14,
                width: "100%",
                padding: "12px",
                background: "rgba(248,113,113,.1)",
                border: "1px solid rgba(248,113,113,.3)",
                color: "#f87171",
                cursor: "pointer",
                borderRadius: 8,
                fontSize: "0.72rem",
                fontWeight: 600,
              }}
            >
              ← Uitloggen
            </button>
          </div>
        )}

        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}
