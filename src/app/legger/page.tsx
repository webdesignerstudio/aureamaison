"use client";

import Link from "next/link";
import { LeggerLayout } from "@/components/layout/legger-layout";
import { useAuth } from "@/hooks/use-auth";
import { useOrders } from "@/hooks/use-orders";
import { useUpdateOrder } from "@/hooks/use-orders";
import { StatusBadge } from "@/components/ui/status-badge";
import { Spinner } from "@/components/ui/spinner";
import { formatDate, formatEuro } from "@/lib/utils";
import { useToastContext } from "@/components/toast-provider";
import { useState } from "react";

export default function LeggerPortalPage() {
  const { user } = useAuth();
  const toast = useToastContext();
  const updateOrder = useUpdateOrder();
  const [activeTab, setActiveTab] = useState<"open" | "aangenomen" | "afgerond">("open");
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReden, setRejectReden] = useState("");

  const { data: orders, isLoading } = useOrders(user?.company_id);

  const myOrders = orders?.filter((o) => o.legger_id === user?.id) || [];

  const openstaand = myOrders.filter(
    (o) => o.legger_id === user?.id && !o.legger_geaccepteerd && o.status !== "afgerond" && o.status !== "afgewezen"
  );
  const aangenomen = myOrders.filter(
    (o) => o.legger_geaccepteerd && o.status !== "afgerond" && o.status !== "afgewezen"
  );
  const afgerondList = myOrders.filter(
    (o) => o.status === "afgerond" || o.status === "afgewezen"
  );

  const tabOrders =
    activeTab === "open" ? openstaand :
    activeTab === "aangenomen" ? aangenomen :
    afgerondList;

  const handleAccept = async (orderId: string) => {
    try {
      await updateOrder.mutateAsync({ id: orderId, legger_geaccepteerd: true });
      toast.success("Klus geaccepteerd");
    } catch {
      toast.error("Accepteren mislukt");
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await updateOrder.mutateAsync({
        id: rejectModal,
        legger_id: null,
        legger_naam: null,
        legger_geaccepteerd: false,
      });
      toast.success("Klus geweigerd");
      setRejectModal(null);
      setRejectReden("");
    } catch {
      toast.error("Weigeren mislukt");
    }
  };

  if (isLoading) {
    return (
      <LeggerLayout>
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      </LeggerLayout>
    );
  }

  return (
    <LeggerLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Mijn Klussen
        </h1>
        <p className="mt-2 text-muted">Overzicht van uw toegewezen klussen.</p>

        {/* Tabs */}
        <div className="mt-6 flex gap-2 border-b border-gold/10">
          {(["open", "aangenomen", "afgerond"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition ${
                activeTab === tab
                  ? "border-b-2 border-gold text-gold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab === "open" ? `Openstaand (${openstaand.length})` :
               tab === "aangenomen" ? `Aangenomen (${aangenomen.length})` :
               `Afgerond (${afgerondList.length})`}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-gold/10 bg-deep">
          {tabOrders.length === 0 ? (
            <div className="p-8 text-center text-muted">Geen klussen in deze categorie.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gold/10 text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Klant</th>
                  <th className="px-4 py-3">Adres</th>
                  <th className="px-4 py-3">Vloer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Prijs</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5">
                {tabOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gold/5">
                    <td className="px-4 py-3">
                      <Link href={`/legger/klus/${order.id}`} className="font-medium text-foreground hover:text-gold">
                        {order.client_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted">{order.straat}, {order.plaats}</td>
                    <td className="px-4 py-3 text-sm text-muted">{order.vloer_type || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
                    <td className="px-4 py-3 text-sm text-muted">
                      {order.legger_prijs ? `€ ${formatEuro(order.legger_prijs)}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {activeTab === "open" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAccept(order.id)}
                            disabled={updateOrder.isPending}
                            className="rounded bg-green-500/10 px-3 py-1 text-xs font-bold text-green-400 hover:bg-green-500/20 disabled:opacity-50"
                          >
                            ✓ Accepteren
                          </button>
                          <button
                            onClick={() => setRejectModal(order.id)}
                            className="rounded bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400 hover:bg-red-500/20"
                          >
                            ✕ Weigeren
                          </button>
                        </div>
                      )}
                      {activeTab === "aangenomen" && (
                        <Link href={`/legger/klus/${order.id}`} className="text-xs text-gold hover:underline">
                          Details →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Weiger modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-deep p-6">
            <h3 className="font-[family-name:var(--font-cormorant)] text-xl text-red-400">Klus weigeren</h3>
            <p className="mt-2 text-sm text-muted">Weet u zeker dat u deze klus wilt weigeren?</p>
            <textarea
              value={rejectReden}
              onChange={(e) => setRejectReden(e.target.value)}
              placeholder="Reden (optioneel)..."
              rows={3}
              className="mt-4 w-full rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 rounded-lg border border-gold/10 px-4 py-2 text-xs font-bold uppercase text-muted hover:text-foreground">
                Annuleren
              </button>
              <button onClick={handleReject} disabled={updateOrder.isPending} className="flex-1 rounded-lg bg-red-500/10 px-4 py-2 text-xs font-bold uppercase text-red-400 hover:bg-red-500/20">
                {updateOrder.isPending ? "Bezig..." : "Weigeren"}
              </button>
            </div>
          </div>
        </div>
      )}
    </LeggerLayout>
  );
}
