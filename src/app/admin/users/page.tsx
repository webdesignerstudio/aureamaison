"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export default function AdminUsersPage() {
  const supabase = createClient();
  const [filterRole, setFilterRole] = useState("");

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      return data || [];
    },
  });

  const filtered = filterRole ? users.filter((u: any) => u.role === filterRole) : users;

  return (
    <div>
      <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "2rem", fontWeight: 300, color: "#f1f5f9", margin: "0 0 16px" }}>
        Users
      </h1>

      <div style={{ marginBottom: 16 }}>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: "8px 12px",
            background: "rgba(255,255,255,.04)",
            border: "1px solid #0f172a",
            borderRadius: 6,
            color: "#f1f5f9",
            fontSize: "0.72rem",
          }}
        >
          <option value="">Alle rollen</option>
          <option value="owner">Owner</option>
          <option value="superadmin">Superadmin</option>
          <option value="legger">Legger</option>
          <option value="client">Client</option>
        </select>
      </div>

      <div style={{ background: "#080e1a", border: "1px solid #0f172a", borderRadius: 10, padding: 16 }}>
        <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginBottom: 12 }}>
          {filtered.length} gebruikers
        </div>
        <div style={{ fontSize: "0.65rem", color: "#475569" }}>
          {filtered.map((u: any) => (
            <div key={u.id} style={{ padding: "10px 0", borderBottom: "1px solid #0f172a", display: "flex", justifyContent: "space-between" }}>
              <span>{u.email}</span>
              <span style={{ color: "#94a3b8" }}>{u.role}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
