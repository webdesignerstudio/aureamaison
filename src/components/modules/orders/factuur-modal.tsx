"use client";

import { useState, useEffect } from "react";
import { generateInvoiceHTML } from "@/lib/invoice";
import type { Order, Settings } from "@/types";

interface FactuurModalProps {
  order: Order;
  settings: Settings | null | undefined;
  open: boolean;
  onClose: () => void;
}

export function FactuurModal({ order, settings, open, onClose }: FactuurModalProps) {
  const [betaalTermijn, setBetaalTermijn] = useState(14);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (!open || !order) return;
    const s: Partial<Settings> = settings || {};
    const invoiceSettings = {
      bedrijf_naam: s.bedrijf_naam || "Aurea Maison Floors",
      bedrijf_adres: s.bedrijf_adres || "Zuidwijkstraat 28",
      bedrijf_postcode: s.bedrijf_postcode || "2729 KD",
      bedrijf_plaats: s.bedrijf_plaats || "Zoetermeer",
      bedrijf_tel: s.bedrijf_tel || "06 28 27 35 70",
      bedrijf_email: s.bedrijf_email || "Aureamaisonfloors@gmail.com",
      kvk: s.kvk || "42032896",
      btw: s.btw || "NL00544489B03",
      iban: s.iban || "NL66 KNAB 0800 1498 74",
      factuur_btw_pct: s.factuur_btw_pct ?? 21,
      factuur_betaal_termijn: betaalTermijn,
      factuur_voetnoot: s.factuur_voetnoot || "",
    };
    setHtml(generateInvoiceHTML(order, invoiceSettings));
  }, [open, order, settings, betaalTermijn]);

  const handlePrint = () => {
    if (!html) return;
    const w = window.open("", "_blank", "width=920,height=750");
    if (!w) { alert("Sta pop-ups toe om de factuur te printen"); return; }
    w.document.write(html); w.document.close();
    setTimeout(() => { w.focus(); w.print(); }, 600);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex flex-col bg-background" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-gold/10 bg-background/98 px-6 py-4 backdrop-blur-xl">
        <div>
          <div className="text-[0.5rem] uppercase tracking-[0.25em] text-gold">Factuur</div>
          <div className="font-[family-name:var(--font-cormorant)] text-xl font-light text-foreground">
            {order.invoice_nr || `FACT-${new Date().getFullYear()}-0001`} — <em className="text-gold-light">{order.client_name}</em>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={betaalTermijn}
            onChange={(e) => setBetaalTermijn(Number(e.target.value))}
            className="rounded-lg border border-gold/10 bg-background px-3 py-2 text-sm text-foreground focus:border-gold focus:outline-none"
          >
            {[7, 14, 21, 30].map((d) => (
              <option key={d} value={d}>{d} dagen betaaltermijn</option>
            ))}
          </select>
          <button
            onClick={handlePrint}
            className="rounded-lg bg-gold/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold transition hover:bg-gold/20"
          >
            Afdrukken
          </button>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted transition hover:text-foreground"
          >
            Sluiten
          </button>
        </div>
      </div>

      {/* A4 Preview */}
      <div className="flex-1 overflow-y-auto p-7">
        <div className="mx-auto max-w-[794px]">
          {!html ? (
            <div className="py-20 text-center text-muted">Factuur laden…</div>
          ) : (
            <div
              className="overflow-hidden rounded-sm bg-white shadow-2xl"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
