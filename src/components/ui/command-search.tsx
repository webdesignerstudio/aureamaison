"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { C } from "@/lib/landing/colors";

interface SearchResult {
  type: string;
  title: string;
  subtitle?: string;
  description?: string;
  icon: string;
  path: string;
}

export function CommandSearch() {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Trigger: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
      if (open && e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Search logic
  const handleSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }

      const query_lower = q.toLowerCase();
      const searchResults: SearchResult[] = [];

      // Navigation shortcuts
      const shortcuts = [
        { title: "Dashboard", path: "/dashboard", icon: "📊" },
        { title: "Orders", path: "/dashboard/orders", icon: "📋" },
        { title: "Leggers", path: "/dashboard/leggers", icon: "👷" },
        { title: "Klanten", path: "/dashboard/klanten", icon: "👤" },
        { title: "Abonnementen", path: "/dashboard/abonnementen", icon: "💳" },
        { title: "Marktplaats", path: "/dashboard/marktplaats", icon: "🏪" },
        { title: "Taken", path: "/dashboard/taken", icon: "✓" },
        { title: "Audit", path: "/dashboard/audit", icon: "📝" },
        { title: "Admin", path: "/admin", icon: "⚙️" },
      ];

      shortcuts.forEach((s) => {
        if (s.title.toLowerCase().includes(query_lower)) {
          searchResults.push({
            type: "nav",
            title: s.title,
            subtitle: "Navigatie",
            icon: s.icon,
            path: s.path,
          });
        }
      });

      // Search in orders
      try {
        const { data: orders } = await supabase
          .from("orders")
          .select("id, clientName, uaid")
          .ilike("clientName", `%${q}%`)
          .limit(5);

        orders?.forEach((o: any) => {
          searchResults.push({
            type: "order",
            title: o.clientName,
            subtitle: "Order",
            description: `UAID: ${o.uaid}`,
            icon: "📋",
            path: `/dashboard/orders/${o.id}`,
          });
        });
      } catch (err) {
        console.error("Order search error:", err);
      }

      // Search in leggers
      try {
        const { data: leggers } = await supabase
          .from("leggers")
          .select("profiel_id, naam, email")
          .ilike("naam", `%${q}%`)
          .limit(5);

        leggers?.forEach((l: any) => {
          searchResults.push({
            type: "legger",
            title: l.naam,
            subtitle: "Legger",
            description: l.email,
            icon: "👷",
            path: `/dashboard/leggers/${l.profiel_id}`,
          });
        });
      } catch (err) {
        console.error("Legger search error:", err);
      }

      // Search in tasks
      try {
        const { data: taken } = await supabase
          .from("taken")
          .select("id, titel, status")
          .ilike("titel", `%${q}%`)
          .limit(5);

        taken?.forEach((t: any) => {
          searchResults.push({
            type: "task",
            title: t.titel,
            subtitle: "Taak",
            description: t.status,
            icon: "✓",
            path: `/dashboard/taken#${t.id}`,
          });
        });
      } catch (err) {
        console.error("Task search error:", err);
      }

      setResults(searchResults.slice(0, 8));
      setSelectedIndex(0);
    },
    [supabase]
  );

  useEffect(() => {
    const timer = setTimeout(() => handleSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  const handleSelect = (path: string) => {
    router.push(path);
    setOpen(false);
    setQuery("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % results.length);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + results.length) % results.length);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex].path);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "20vh",
        zIndex: 1000,
      }}
      onClick={() => setOpen(false)}
    >
      <div
        style={{
          background: C.deep,
          border: `1px solid ${C.bdr}`,
          borderRadius: 12,
          width: "90%",
          maxWidth: 500,
          boxShadow: "0 20px 25px -5px rgba(0,0,0,.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div style={{ padding: "16px", borderBottom: `1px solid ${C.bdr}` }}>
          <input
            autoFocus
            type="text"
            placeholder="Zoek orders, leggers, taken... (Cmd+K)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              width: "100%",
              padding: "10px 14px",
              background: "transparent",
              border: "none",
              color: C.white,
              fontSize: "0.9rem",
              outline: "none",
            }}
          />
        </div>

        {/* Results */}
        <div style={{ maxHeight: 400, overflowY: "auto" }}>
          {results.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: C.muted, fontSize: "0.72rem" }}>
              {query ? "Geen resultaten gevonden" : "Typ om te zoeken..."}
            </div>
          ) : (
            results.map((result, idx) => (
              <div
                key={`${result.type}-${result.title}`}
                onClick={() => handleSelect(result.path)}
                style={{
                  padding: "12px 16px",
                  background: selectedIndex === idx ? "rgba(198,165,107,.1)" : "transparent",
                  borderBottom: `1px solid ${C.bdr}`,
                  cursor: "pointer",
                  transition: "background .15s",
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.1rem" }}>{result.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: C.white }}>
                      {result.title}
                    </div>
                    {result.subtitle && (
                      <div style={{ fontSize: "0.65rem", color: C.muted, marginTop: 2 }}>
                        {result.subtitle}
                        {result.description && ` • ${result.description}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "8px 16px", borderTop: `1px solid ${C.bdr}`, fontSize: "0.6rem", color: C.dim, display: "flex", gap: 16 }}>
          <span>↑↓ Navigeren</span>
          <span>⏎ Selecteren</span>
          <span>Esc Sluiten</span>
        </div>
      </div>
    </div>
  );
}
