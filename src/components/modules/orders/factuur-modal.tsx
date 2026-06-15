"use client";

import { useState, useEffect } from "react";
import { C } from "@/lib/landing/colors";
import type { Order, Settings } from "@/types";

interface FactuurModalProps {
  order: Order;
  settings: Settings | null | undefined;
  open: boolean;
  onClose: () => void;
  onSavePaymentLink?: (paymentId: string, checkoutUrl: string) => void;
}

function fmtEur(n: number | string | null | undefined) {
  return Number(n || 0).toLocaleString("nl-NL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtFactuurDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function printFactuurA4(order: Order, s: Partial<Settings>, betaalTermijn: number) {
  const btwPct = s.factuur_btw_pct ?? 21;
  const inclBTW = parseFloat(String(order.price)) || 0;
  const exclBTW = inclBTW / (1 + btwPct / 100);
  const btwBedrag = inclBTW - exclBTW;
  const factuurNr = order.invoice_nr || `FACT-${new Date().getFullYear()}-0001`;
  const verzendDatum = new Date().toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
  const bd = new Date(); bd.setDate(bd.getDate() + betaalTermijn);
  const betaalDatum = bd.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
  const omschrijving = [order.vloer_type, order.oppervlakte ? `${order.oppervlakte} m²` : null, order.opmerking || null].filter(Boolean).join(" · ");

  const bedrijfNaam  = s.bedrijf_naam    || "Aurea Maison Floors";
  const bedrijfAdres = s.bedrijf_adres   || "Zuidwijkstraat 28";
  const bedrijfPc    = s.bedrijf_postcode|| "2729 KD";
  const bedrijfPlaats= s.bedrijf_plaats  || "Zoetermeer";
  const bedrijfTel   = s.bedrijf_tel     || "06 28 27 35 70";
  const bedrijfEmail = s.bedrijf_email   || "Aureamaisonfloors@gmail.com";
  const kvk          = s.kvk             || "42032896";
  const btwNr        = s.btw             || "NL00544489B03";
  const iban         = s.iban            || "NL66 KNAB 0800 1498 74";
  const voetnoot     = s.factuur_voetnoot|| `Bij vragen: ${bedrijfEmail} · ${bedrijfTel}`;

  const emptyRows = Array.from({ length: 3 }).map(() => `<tr><td style="padding:12px 11px">&nbsp;</td><td style="padding:12px 11px;text-align:right">&nbsp;</td></tr>`).join("");

  const html = `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/>
  <title>Factuur ${factuurNr} — ${bedrijfNaam}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Arial,sans-serif;background:#fff;color:#1a1a1a;font-size:13px;line-height:1.55}
    @page{size:A4;margin:0}
    @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
    .page{width:794px;min-height:1123px;padding:56px 60px;position:relative}
    table{width:100%;border-collapse:collapse}
    .footer{position:absolute;bottom:48px;left:60px;right:60px;border-top:1px solid #ddd;padding-top:14px;text-align:center}
  </style></head><body><div class="page">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px">
      <div>
        <div style="font-size:19px;font-weight:700;letter-spacing:1px;margin-bottom:8px">${bedrijfNaam}</div>
        <div style="font-size:11.5px;color:#444;line-height:1.75">${bedrijfAdres}<br>${bedrijfPc} ${bedrijfPlaats}<br>Tel: ${bedrijfTel}</div>
        <div style="font-size:11.5px;color:#444;line-height:1.75;margin-top:6px">Email: ${bedrijfEmail}<br>KvK: ${kvk}<br>BTW: ${btwNr}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:26px;font-weight:300;letter-spacing:5px;margin-bottom:4px">Factuur</div>
        <div style="font-size:11.5px;color:#666">Verzonden op ${verzendDatum}</div>
      </div>
    </div>
    <div style="border-top:1.5px solid #1a1a1a;margin-bottom:22px"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;margin-bottom:26px">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:7px">Factuur voor</div>
        <div style="font-weight:600;margin-bottom:3px">${order.client_name || "—"}</div>
        ${order.bedrijf ? `<div style="font-size:12px;color:#444">${order.bedrijf}</div>` : ""}
        <div style="font-size:11.5px;color:#444;line-height:1.7;margin-top:4px">
          ${order.straat ? `<div>${order.straat}</div>` : ""}
          <div>${[order.postcode, order.plaats].filter(Boolean).join(" ")}</div>
        </div>
        ${order.kvk ? `<div style="font-size:10.5px;color:#666;margin-top:5px">KvK: ${order.kvk}</div>` : ""}
        ${order.btw ? `<div style="font-size:10.5px;color:#666">BTW: ${order.btw}</div>` : ""}
      </div>
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:7px">Verschuldigd aan</div>
        <div style="font-weight:600;margin-bottom:3px">${bedrijfNaam}</div>
        <div style="font-size:11.5px;color:#444;line-height:1.7">${bedrijfAdres}<br>${bedrijfPc} ${bedrijfPlaats}</div>
        <div style="margin-top:12px">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px">Project</div>
          <div style="font-size:11.5px;color:#444">${[order.straat, order.plaats].filter(Boolean).join(", ") || "—"}</div>
          ${order.datum ? `<div style="font-size:10.5px;color:#666;margin-top:3px">Werkdatum: ${fmtFactuurDate(order.datum)}</div>` : ""}
        </div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:7px">Factuurnr.</div>
        <div style="font-weight:700;font-size:14px;margin-bottom:16px">${factuurNr}</div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:4px">Uiterste betaaldatum</div>
        <div style="font-weight:600;color:#c0392b">${betaalDatum}</div>
      </div>
    </div>
    <table>
      <thead>
        <tr style="background:#f5f5f5;border-bottom:1.5px solid #1a1a1a">
          <th style="text-align:left;padding:9px 11px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555">Beschrijving</th>
          <th style="text-align:right;padding:9px 11px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555;white-space:nowrap">Totaalbedrag Excl btw</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e8e8e8">
          <td style="padding:12px 11px;font-size:12.5px">${omschrijving || "—"}</td>
          <td style="padding:12px 11px;text-align:right;font-size:12.5px;white-space:nowrap">€ ${fmtEur(exclBTW)}</td>
        </tr>
        ${emptyRows}
      </tbody>
    </table>
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-top:1.5px solid #1a1a1a;padding-top:16px">
      <div style="flex:1;padding-right:40px">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:7px">Opmerkingen:</div>
        <div style="font-size:12px;color:#444;line-height:1.7">${order.opmerking || ""}</div>
        ${voetnoot ? `<div style="font-size:10.5px;color:#888;margin-top:12px;font-style:italic">${voetnoot}</div>` : ""}
      </div>
      <div style="min-width:210px">
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #e8e8e8"><span style="font-size:12px;color:#555">Subtotaal ex btw</span><span style="font-size:12px">€ ${fmtEur(exclBTW)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #e8e8e8"><span style="font-size:12px;color:#555">BTW (${btwPct}%)</span><span style="font-size:12px">€ ${fmtEur(btwBedrag)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:9px 0 0;border-top:1.5px solid #1a1a1a;margin-top:4px">
          <span style="font-weight:700;font-size:13.5px">Totaal incl. BTW</span>
          <span style="font-weight:700;font-size:13.5px">€ ${fmtEur(inclBTW)}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <div style="font-size:10.5px;color:#888;line-height:1.9">
        Betaling o.v.v. factuurnummer <strong style="color:#1a1a1a">${factuurNr}</strong> op IBAN <strong style="color:#1a1a1a">${iban}</strong> t.n.v. ${bedrijfNaam}
      </div>
      <div style="font-size:9.5px;color:#bbb;margin-top:5px">${bedrijfEmail} · ${bedrijfTel} · KvK ${kvk} · BTW ${btwNr}</div>
    </div>
  </div></body></html>`;

  const w = window.open("", "_blank", "width=920,height=750");
  if (!w) { alert("Sta pop-ups toe om de factuur te printen"); return; }
  w.document.write(html); w.document.close();
  setTimeout(() => { w.focus(); w.print(); }, 600);
}

export function FactuurModal({ order, settings, open, onClose, onSavePaymentLink }: FactuurModalProps) {
  const [betaalTermijn, setBetaalTermijn] = useState(14);
  const [isMobile, setIsMobile] = useState(false);
  const [scale, setScale] = useState(1);
  const A4_W = 794;
  const [betaalLink, setBetaalLink] = useState<string | null>(order.mollie_checkout_url || null);
  const [betaalLoading, setBetaalLoading] = useState(false);
  const [betaalErr, setBetaalErr] = useState<string | null>(null);
  const [gekopieerd, setGekopieerd] = useState(false);

  useEffect(() => {
    if (!open) return;
    const s = settings || {};
    setBetaalTermijn((s as Partial<Settings>).factuur_betaal_termijn || 14);
    setBetaalLink(order.mollie_checkout_url || null);
    setBetaalErr(null);
    setGekopieerd(false);
  }, [open, settings, order.mollie_checkout_url]);

  const genereerBetaallink = async () => {
    const inclBTW = parseFloat(String(order.price)) || 0;
    if (!inclBTW) { setBetaalErr("Stel eerst een prijs in op de order."); return; }
    setBetaalLoading(true);
    setBetaalErr(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: inclBTW,
          description: order.invoice_nr || `FACT-${new Date().getFullYear()}-0001`,
          metadata: { order_id: order.id, invoice_nr: order.invoice_nr || `FACT-${new Date().getFullYear()}-0001` },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) { setBetaalErr(data.error || "Kon betaallink niet aanmaken"); return; }
      setBetaalLink(data.checkoutUrl);
      navigator.clipboard?.writeText(data.checkoutUrl).catch(() => {});
      setGekopieerd(true);
      setTimeout(() => setGekopieerd(false), 3000);
      onSavePaymentLink?.(data.paymentId, data.checkoutUrl);
    } catch {
      setBetaalErr("Netwerkfout — probeer opnieuw");
    } finally {
      setBetaalLoading(false);
    }
  };

  const kopieerLink = () => {
    if (!betaalLink) return;
    navigator.clipboard?.writeText(betaalLink).catch(() => {});
    setGekopieerd(true);
    setTimeout(() => setGekopieerd(false), 3000);
  };

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      setIsMobile(vw < 640);
      setScale(Math.min(1, (Math.min(vw - 48, 860)) / A4_W));
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  if (!open || !order) return null;

  const s: Partial<Settings> = settings || {};
  const btwPct    = s.factuur_btw_pct ?? 21;
  const inclBTW   = parseFloat(String(order.price)) || 0;
  const exclBTW   = inclBTW / (1 + btwPct / 100);
  const btwBedrag = inclBTW - exclBTW;
  const omschrijving = [order.vloer_type, order.oppervlakte ? `${order.oppervlakte} m²` : null, order.opmerking || null].filter(Boolean).join(" · ");
  const factuurNrRef  = order.invoice_nr || `FACT-${new Date().getFullYear()}-0001`;
  const factuurNr = factuurNrRef;
  const verzendDatum = new Date().toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });
  const bd = new Date(); bd.setDate(bd.getDate() + betaalTermijn);
  const betaalDatum = bd.toLocaleDateString("nl-NL", { day: "2-digit", month: "2-digit", year: "numeric" });

  const bedrijfNaam   = s.bedrijf_naam    || "Aurea Maison Floors";
  const bedrijfAdres  = s.bedrijf_adres   || "Zuidwijkstraat 28";
  const bedrijfPc     = s.bedrijf_postcode|| "2729 KD";
  const bedrijfPlaats = s.bedrijf_plaats  || "Zoetermeer";
  const bedrijfTel    = s.bedrijf_tel     || "06 28 27 35 70";
  const bedrijfEmail  = s.bedrijf_email   || "Aureamaisonfloors@gmail.com";
  const kvk           = s.kvk             || "42032896";
  const btwNr         = s.btw             || "NL00544489B03";
  const iban          = s.iban            || "NL66 KNAB 0800 1498 74";
  const voetnoot      = s.factuur_voetnoot|| "";

  const handlePrint = () => printFactuurA4(order, s, betaalTermijn);

  const toolbar = (
    <div style={{ position: "sticky", top: 0, zIndex: 10, background: "rgba(10,10,8,.98)", backdropFilter: "blur(20px)", borderBottom: `1px solid ${C.bdr}`, padding: isMobile ? "12px 14px" : "16px 28px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: "0.5rem", letterSpacing: 4, color: C.gold, textTransform: "uppercase", marginBottom: 2 }}>Factuur</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: isMobile ? "1.1rem" : "1.5rem", fontWeight: 300, color: C.white }}>
            {factuurNr}{!isMobile && <> — <em style={{ fontStyle: "italic", color: C.goldL }}>{order.client_name}</em></>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {!isMobile && (
            <select value={betaalTermijn} onChange={(e) => setBetaalTermijn(Number(e.target.value))}
              style={{ background: "rgba(255,255,255,.06)", border: `1px solid ${C.bdr}`, color: C.white, padding: "8px 12px", borderRadius: 7, fontSize: 12, cursor: "pointer", outline: "none" }}>
              {[7, 14, 21, 30].map((d) => <option key={d} value={d}>{d} dagen betaaltermijn</option>)}
            </select>
          )}
          <button onClick={genereerBetaallink} disabled={betaalLoading || !!betaalLink}
            style={{ padding: isMobile ? "9px 12px" : "10px 18px", background: betaalLink ? "rgba(60,184,122,.08)" : "rgba(74,158,232,.1)", border: `1px solid ${betaalLink ? C.greenBdr : "rgba(74,158,232,.35)"}`, color: betaalLink ? C.green : C.blue, fontSize: "0.63rem", fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", cursor: betaalLoading || !!betaalLink ? "default" : "pointer", borderRadius: 8, whiteSpace: "nowrap", opacity: betaalLoading ? 0.6 : 1 }}>
            {betaalLoading ? "Bezig…" : betaalLink ? "💳 Link actief ✓" : "💳 Betaallink (iDEAL)"}
          </button>
          <button onClick={handlePrint} style={{ padding: isMobile ? "9px 14px" : "10px 20px", background: "rgba(198,165,107,.12)", border: `1px solid ${C.bdrH}`, color: C.gold, fontSize: "0.63rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8, whiteSpace: "nowrap" }}>
            🖨 {isMobile ? "PDF" : "Afdrukken / PDF"}
          </button>
          <button onClick={onClose} style={{ padding: isMobile ? "9px 12px" : "10px 16px", background: "none", border: "1px solid rgba(255,255,255,.12)", color: C.muted, fontSize: "0.63rem", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", borderRadius: 8 }}>✕{!isMobile && " Sluiten"}</button>
        </div>
      </div>

      {/* Betaallink result row */}
      {(betaalLink || betaalErr) && (
        <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: betaalErr ? "rgba(224,90,90,.06)" : "rgba(74,158,232,.06)", border: `1px solid ${betaalErr ? C.red + "44" : "rgba(74,158,232,.2)"}`, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          {betaalErr ? (
            <span style={{ fontSize: "0.65rem", color: C.red }}>{betaalErr}</span>
          ) : (
            <>
              <span style={{ fontSize: "0.6rem", color: C.blue, flex: 1, wordBreak: "break-all" }}>{betaalLink}</span>
              <button onClick={kopieerLink} style={{ padding: "5px 12px", background: gekopieerd ? "rgba(60,184,122,.1)" : "rgba(74,158,232,.12)", border: `1px solid ${gekopieerd ? C.greenBdr : "rgba(74,158,232,.3)"}`, color: gekopieerd ? C.green : C.blue, borderRadius: 6, fontSize: "0.58rem", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                {gekopieerd ? "✓ Gekopieerd!" : "📋 Kopieer"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );

  if (isMobile) return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", flexDirection: "column", background: C.bg, overflowY: "auto" }}>
      {toolbar}
      <div style={{ padding: 12, fontFamily: "Arial,sans-serif" }}>
        <div style={{ background: "#1a1a1a", borderRadius: 10, padding: 16, marginBottom: 8, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{bedrijfNaam}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.5)", lineHeight: 1.7 }}>{bedrijfAdres} · {bedrijfPc} {bedrijfPlaats}<br />{bedrijfTel} · KvK {kvk}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 300, letterSpacing: 3, color: C.gold }}>Factuur</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,.4)", marginTop: 2 }}>{verzendDatum}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
          <div style={{ background: "#fff", color: "#1a1a1a", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#999", marginBottom: 5 }}>Factuur voor</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{order.client_name}</div>
            {order.bedrijf && <div style={{ fontSize: 11, color: "#555" }}>{order.bedrijf}</div>}
            <div style={{ fontSize: 11, color: "#666", marginTop: 3, lineHeight: 1.6 }}>
              {order.straat && <div>{order.straat}</div>}
              <div>{[order.postcode, order.plaats].filter(Boolean).join(" ")}</div>
            </div>
          </div>
          <div style={{ background: "#fff", color: "#1a1a1a", borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#999", marginBottom: 5 }}>Factuurnr.</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#C6A56B", marginBottom: 10 }}>{factuurNr}</div>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#999", marginBottom: 4 }}>Betalen voor</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c0392b" }}>{betaalDatum}</div>
          </div>
        </div>
        <div style={{ background: "#fff", color: "#1a1a1a", borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#999", marginBottom: 6 }}>Werkzaamheden</div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <div style={{ fontSize: 12, lineHeight: 1.6, flex: 1 }}>{omschrijving || "—"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>€ {fmtEur(exclBTW)}</div>
          </div>
        </div>
        <div style={{ background: "#fff", color: "#1a1a1a", borderRadius: 8, padding: 12, marginBottom: 8 }}>
          {([["Subtotaal excl. BTW", fmtEur(exclBTW)], [`BTW ${btwPct}%`, fmtEur(btwBedrag)]] as [string, string][]).map(([l, v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
              <span style={{ fontSize: 12, color: "#666" }}>{l}</span><span style={{ fontSize: 12 }}>€ {v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0 0", borderTop: "2px solid #1a1a1a", marginTop: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Totaal incl. BTW</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#C6A56B" }}>€ {fmtEur(inclBTW)}</span>
          </div>
        </div>
        <div style={{ background: "#f9f9f9", color: "#1a1a1a", borderRadius: 8, padding: 12, textAlign: "center", fontSize: 10, lineHeight: 1.9 }}>
          Betaling o.v.v. <strong>{factuurNr}</strong><br />
          IBAN <strong>{iban}</strong><br />
          t.n.v. {bedrijfNaam}
        </div>
        {voetnoot && <div style={{ textAlign: "center", fontSize: 10, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>{voetnoot}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9000, display: "flex", flexDirection: "column", background: C.bg, overflowY: "auto" }}>
      {toolbar}
      <div style={{ flex: 1, padding: 28, display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
        <div style={{ transformOrigin: "top center", transform: `scale(${scale})`, width: A4_W, marginBottom: scale < 1 ? `${-(A4_W * (1 - scale) * 0.55)}px` : 0, boxShadow: "0 32px 96px rgba(0,0,0,.8)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ fontFamily: "Arial,sans-serif", background: "#fff", color: "#1a1a1a", width: A4_W, minHeight: 1123, padding: "56px 60px", fontSize: 13, lineHeight: 1.55, boxSizing: "border-box", position: "relative" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, letterSpacing: 1, marginBottom: 8 }}>{bedrijfNaam}</div>
                <div style={{ fontSize: 11.5, color: "#444", lineHeight: 1.75 }}>{bedrijfAdres}<br />{bedrijfPc} {bedrijfPlaats}<br />Tel: {bedrijfTel}</div>
                <div style={{ fontSize: 11.5, color: "#444", lineHeight: 1.75, marginTop: 6 }}>Email: {bedrijfEmail}<br />KvK: {kvk}<br />BTW: {btwNr}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 26, fontWeight: 300, letterSpacing: 5, marginBottom: 4 }}>Factuur</div>
                <div style={{ fontSize: 11.5, color: "#666" }}>Verzonden op {verzendDatum}</div>
              </div>
            </div>
            <div style={{ borderTop: "1.5px solid #1a1a1a", marginBottom: 22 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 26 }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 7 }}>Factuur voor</div>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>{order.client_name}</div>
                {order.bedrijf && <div style={{ fontSize: 12, color: "#444" }}>{order.bedrijf}</div>}
                <div style={{ fontSize: 11.5, color: "#444", lineHeight: 1.7, marginTop: 4 }}>
                  {order.straat && <div>{order.straat}</div>}
                  <div>{[order.postcode, order.plaats].filter(Boolean).join(" ")}</div>
                </div>
                {order.kvk && <div style={{ fontSize: 10.5, color: "#666", marginTop: 5 }}>KvK: {order.kvk}</div>}
                {order.btw && <div style={{ fontSize: 10.5, color: "#666" }}>BTW: {order.btw}</div>}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 7 }}>Verschuldigd aan</div>
                <div style={{ fontWeight: 600, marginBottom: 3 }}>{bedrijfNaam}</div>
                <div style={{ fontSize: 11.5, color: "#444", lineHeight: 1.7 }}>{bedrijfAdres}<br />{bedrijfPc} {bedrijfPlaats}</div>
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 4 }}>Project</div>
                  <div style={{ fontSize: 11.5, color: "#444" }}>{[order.straat, order.plaats].filter(Boolean).join(", ") || "—"}</div>
                  {order.datum && <div style={{ fontSize: 10.5, color: "#666", marginTop: 3 }}>Werkdatum: {fmtFactuurDate(order.datum)}</div>}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 7 }}>Factuurnr.</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{factuurNr}</div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 4 }}>Uiterste betaaldatum</div>
                <div style={{ fontWeight: 600, color: "#c0392b" }}>{betaalDatum}</div>
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 0 }}>
              <thead>
                <tr style={{ background: "#f5f5f5", borderBottom: "1.5px solid #1a1a1a" }}>
                  <th style={{ textAlign: "left", padding: "9px 11px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#555" }}>Beschrijving</th>
                  <th style={{ textAlign: "right", padding: "9px 11px", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#555", whiteSpace: "nowrap" }}>Totaalbedrag Excl btw</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #e8e8e8" }}>
                  <td style={{ padding: "12px 11px", fontSize: 12.5 }}>{omschrijving || "—"}</td>
                  <td style={{ padding: "12px 11px", textAlign: "right", fontSize: 12.5, whiteSpace: "nowrap" }}>€ {fmtEur(exclBTW)}</td>
                </tr>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #e8e8e8" }}>
                    <td style={{ padding: "12px 11px" }}>&nbsp;</td><td style={{ padding: "12px 11px" }}>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderTop: "1.5px solid #1a1a1a", paddingTop: 16 }}>
              <div style={{ flex: 1, paddingRight: 40 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "#888", marginBottom: 7 }}>Opmerkingen:</div>
                <div style={{ fontSize: 12, color: "#444", lineHeight: 1.7 }}>{order.opmerking || ""}</div>
                {voetnoot && <div style={{ fontSize: 10.5, color: "#999", marginTop: 12, fontStyle: "italic" }}>{voetnoot}</div>}
              </div>
              <div style={{ minWidth: 210 }}>
                {([["Subtotaal ex btw", fmtEur(exclBTW)], [`BTW (${btwPct}%)`, fmtEur(btwBedrag)]] as [string, string][]).map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #e8e8e8" }}>
                    <span style={{ fontSize: 12, color: "#555" }}>{l}</span><span style={{ fontSize: 12 }}>€ {v}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "9px 0 0", borderTop: "1.5px solid #1a1a1a", marginTop: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>Totaal incl. BTW</span>
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>€ {fmtEur(inclBTW)}</span>
                </div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 48, left: 60, right: 60, borderTop: "1px solid #ddd", paddingTop: 14 }}>
              <div style={{ fontSize: 10.5, color: "#888", textAlign: "center", lineHeight: 1.9 }}>
                Betaling o.v.v. factuurnummer <strong style={{ color: "#1a1a1a" }}>{factuurNr}</strong> op IBAN <strong style={{ color: "#1a1a1a" }}>{iban}</strong> t.n.v. {bedrijfNaam}
              </div>
              <div style={{ fontSize: 9.5, color: "#bbb", textAlign: "center", marginTop: 5 }}>{bedrijfEmail} · {bedrijfTel} · KvK {kvk} · BTW {btwNr}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
