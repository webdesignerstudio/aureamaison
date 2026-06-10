"use client";

const STATUS_MAP: Record<string, { bg: string; fg: string; text: string }> = {
  ingediend: { bg: "bg-orange-500/10", fg: "text-orange-400", text: "Ingediend" },
  "in behandeling": { bg: "bg-blue-500/10", fg: "text-blue-400", text: "In behandeling" },
  "offerte verstuurd": { bg: "bg-purple-500/10", fg: "text-purple-400", text: "Offerte verstuurd" },
  gepland: { bg: "bg-purple-500/10", fg: "text-purple-400", text: "Gepland" },
  bezig: { bg: "bg-blue-500/10", fg: "text-blue-400", text: "Bezig" },
  "ter goedkeuring": { bg: "bg-orange-500/10", fg: "text-orange-400", text: "Ter goedkeuring" },
  afgerond: { bg: "bg-green-500/10", fg: "text-green-400", text: "Afgerond" },
  afgewezen: { bg: "bg-red-500/10", fg: "text-red-400", text: "Afgewezen" },
  actief: { bg: "bg-green-500/10", fg: "text-green-400", text: "Actief" },
  inactief: { bg: "bg-red-500/10", fg: "text-red-400", text: "Inactief" },
  betaald: { bg: "bg-green-500/10", fg: "text-green-400", text: "Betaald" },
  openstaand: { bg: "bg-orange-500/10", fg: "text-orange-400", text: "Openstaand" },
  owner: { bg: "bg-gold/10", fg: "text-gold", text: "Eigenaar" },
  legger: { bg: "bg-blue-500/10", fg: "text-blue-400", text: "Legger" },
  client: { bg: "bg-gray-500/10", fg: "text-gray-400", text: "Klant" },
  superadmin: { bg: "bg-purple-500/10", fg: "text-purple-400", text: "Super Admin" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const s = STATUS_MAP[status] || { bg: "bg-gray-500/10", fg: "text-gray-400", text: status || "—" };
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium tracking-wide ${s.bg} ${s.fg} border border-current/20 ${className}`}
    >
      {s.text}
    </span>
  );
}
