"use client";

import { C } from "@/lib/landing/colors";

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  ingediend: { color: C.orange, text: "Ingediend" },
  "in behandeling": { color: C.blue, text: "In behandeling" },
  "offerte verstuurd": { color: C.purple, text: "Offerte verstuurd" },
  gepland: { color: C.purple, text: "Gepland" },
  bezig: { color: C.blue, text: "Bezig" },
  "ter goedkeuring": { color: C.orange, text: "Ter goedkeuring" },
  afgerond: { color: C.green, text: "Afgerond" },
  afgewezen: { color: C.red, text: "Afgewezen" },
  actief: { color: C.green, text: "Actief" },
  inactief: { color: C.red, text: "Inactief" },
  betaald: { color: C.green, text: "Betaald" },
  openstaand: { color: C.orange, text: "Openstaand" },
  owner: { color: C.gold, text: "Eigenaar" },
  legger: { color: C.blue, text: "Legger" },
  client: { color: C.gray, text: "Klant" },
  superadmin: { color: C.purple, text: "Super Admin" },
};

interface StatusBadgeProps {
  status: string;
  style?: React.CSSProperties;
}

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const s = STATUS_MAP[status] || { color: C.gray, text: status || "—" };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 9px",
        borderRadius: 99,
        fontSize: "0.56rem",
        fontWeight: 700,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        background: s.color + "22",
        color: s.color,
        border: `1px solid ${s.color}44`,
        ...style,
      }}
    >
      {s.text}
    </span>
  );
}
