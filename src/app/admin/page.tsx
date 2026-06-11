"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, formatEuro } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { Order, Profile, Company, AuditLog } from "@/types";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "companies" | "users" | "orders" | "audit">("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("companies").select("*").order("created_at", { ascending: false }),
      supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(100),
    ]).then(([oRes, pRes, cRes, aRes]) => {
      setOrders((oRes.data as Order[]) || []);
      setProfiles((pRes.data as Profile[]) || []);
      setCompanies((cRes.data as Company[]) || []);
      setAuditLogs((aRes.data as AuditLog[]) || []);
      setLoading(false);
    });
  }, []);

  const totalRevenue = orders.filter((o) => o.status === "afgerond").reduce((s, o) => s + (o.price || 0), 0);
  const openOrders = orders.filter((o) => !["afgerond", "afgewezen"].includes(o.status));
  const activeLeggers = profiles.filter((p) => p.role === "legger").length;
  const pendingOnboarding = profiles.filter((p) => p.role === "legger" && p.onboarding_status === "pending").length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Superadmin
        </h1>
        <p className="mt-2 text-muted">Platform overzicht en beheer.</p>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-gold/10">
          {(["overview", "companies", "users", "orders", "audit"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === tab ? "border-b-2 border-gold text-gold" : "text-muted hover:text-foreground"
              }`}
            >
              {tab === "overview" ? "Overview" :
               tab === "companies" ? `Bedrijven (${companies.length})` :
               tab === "users" ? `Gebruikers (${profiles.length})` :
               tab === "orders" ? `Orders (${orders.length})` :
               `Audit (${auditLogs.length})`}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="mt-6 grid gap-6 md:grid-cols-4">
            {[
              { label: "Totale omzet", value: `€ ${formatEuro(totalRevenue)}`, color: "text-gold" },
              { label: "Open orders", value: openOrders.length, color: "text-foreground" },
              { label: "Actieve leggers", value: activeLeggers, color: "text-foreground" },
              { label: "Pending onboarding", value: pendingOnboarding, color: pendingOnboarding > 0 ? "text-red-400" : "text-green-400" },
            ].map((kpi, i) => (
              <div key={i} className="rounded-xl border border-gold/10 bg-deep p-6 text-center">
                <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
                <div className="mt-1 text-xs text-muted uppercase tracking-wider">{kpi.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Companies */}
        {activeTab === "companies" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-gold/10 bg-deep">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Naam</th>
                  <th className="px-4 py-3">Plaats</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Aangemaakt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-gold/5">
                    <td className="px-4 py-3 font-medium text-foreground">{c.naam}</td>
                    <td className="px-4 py-3 text-sm text-muted">{c.plaats || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted">{c.email || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted">{formatDate(c.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-gold/10 bg-deep">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Naam</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Onboarding</th>
                  <th className="px-4 py-3">Aangemaakt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-gold/5">
                    <td className="px-4 py-3 font-medium text-foreground">{p.name || "—"}</td>
                    <td className="px-4 py-3 text-sm text-muted">{p.email}</td>
                    <td className="px-4 py-3 text-sm text-muted capitalize">{p.role}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={p.onboarding_status === "approved" ? "text-green-400" : p.onboarding_status === "pending" ? "text-gold" : "text-red-400"}>
                        {p.onboarding_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="mt-6 overflow-hidden rounded-xl border border-gold/10 bg-deep">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Klant</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Prijs</th>
                  <th className="px-4 py-3">Betaald</th>
                  <th className="px-4 py-3">Datum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gold/5">
                    <td className="px-4 py-3 font-medium text-foreground">{o.client_name}</td>
                    <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-4 py-3 text-sm text-muted">{o.price ? `€ ${formatEuro(o.price)}` : "—"}</td>
                    <td className="px-4 py-3 text-sm">{o.invoice_paid ? <span className="text-green-400">Ja</span> : <span className="text-muted">Nee</span>}</td>
                    <td className="px-4 py-3 text-sm text-muted">{formatDate(o.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Audit */}
        {activeTab === "audit" && (
          <div className="mt-6 space-y-3">
            {auditLogs.length === 0 ? (
              <div className="rounded-xl border border-gold/10 bg-deep p-8 text-center text-muted">Geen audit logs gevonden.</div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-gold/10 bg-deep p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gold">{log.actie}</span>
                    <span className="text-xs text-muted">{formatDate(log.created_at)}</span>
                  </div>
                  <div className="mt-1 text-xs text-muted">
                    {log.user_naam || log.user_rol || "Systeem"} · {log.entity_type} {log.entity_id?.slice(0, 8)}
                  </div>
                  {log.notitie && <div className="mt-1 text-xs italic text-muted/70">"{log.notitie}"</div>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
