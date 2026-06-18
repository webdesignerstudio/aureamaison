"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export default function AdminCompaniesPage() {
  const supabase = createClient();

  const { data: companies = [] } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: async () => {
      const { data, error } = await supabase.from("companies").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#f1f5f9", margin: "0 0 16px" }}>
        Companies
      </h1>
      <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
          {companies.length} bedrijven
        </div>
        <div style={{ marginTop: 12, fontSize: "0.65rem", color: "#475569" }}>
          {companies.map((c: any) => (
            <div key={c.id} style={{ padding: "8px 0", borderBottom: "1px solid #0f172a" }}>
              {c.name} ({c.email})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
