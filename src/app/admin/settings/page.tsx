"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const supabase = createClient();

  const { data: settings = [] } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("settings").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#f1f5f9", margin: "0 0 16px" }}>
        Settings
      </h1>
      <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: 12 }}>
          {settings.length} bedrijfsinstellingen
        </div>
        <div style={{ fontSize: "0.65rem", color: "#475569" }}>
          {settings.map((s: any) => (
            <div key={s.id} style={{ padding: "10px 0", borderBottom: "1px solid #0f172a" }}>
              <div style={{ color: "#f1f5f9" }}>{s.company_id}</div>
              <div style={{ fontSize: "0.6rem", color: "#94a3b8", marginTop: 2 }}>
                Commissie: {(s.commissie_pct_klant || 0) * 100}% klant + {(s.commissie_pct_legger || 0) * 100}% legger
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
