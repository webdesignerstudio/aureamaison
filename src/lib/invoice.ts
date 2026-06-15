import type { Order } from "@/types";

interface InvoiceSettings {
  bedrijf_naam: string;
  bedrijf_adres: string;
  bedrijf_postcode: string;
  bedrijf_plaats: string;
  bedrijf_tel: string;
  bedrijf_email: string;
  kvk: string;
  btw: string;
  iban: string;
  factuur_btw_pct: number;
  factuur_betaal_termijn: number;
  factuur_voetnoot: string;
}

export function generateInvoiceHTML(order: Order, settings: InvoiceSettings): string {
  const btwPct = settings.factuur_btw_pct ?? 21;
  const inclBTW = order.price || 0;
  const exclBTW = inclBTW / (1 + btwPct / 100);
  const btwBedrag = inclBTW - exclBTW;
  const factuurNr = order.invoice_nr || `FACT-${new Date().getFullYear()}-0001`;
  const verzendDatum = new Date().toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const bd = new Date();
  bd.setDate(bd.getDate() + (settings.factuur_betaal_termijn || 14));
  const betaalDatum = bd.toLocaleDateString("nl-NL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const omschrijving = [
    order.vloer_type,
    order.oppervlakte ? `${order.oppervlakte} m²` : null,
    order.opmerking || null,
  ]
    .filter(Boolean)
    .join(" · ");

  const bedrijfNaam = settings.bedrijf_naam || "Aurea Maison Floors";
  const bedrijfAdres = settings.bedrijf_adres || "Zuidwijkstraat 28";
  const bedrijfPc = settings.bedrijf_postcode || "2729 KD";
  const bedrijfPlaats = settings.bedrijf_plaats || "Zoetermeer";
  const bedrijfTel = settings.bedrijf_tel || "06 28 27 35 70";
  const bedrijfEmail = settings.bedrijf_email || "info@aureamaisonfloors.nl";
  const kvk = settings.kvk || "42032896";
  const btwNr = settings.btw || "NL00544489B03";
  const iban = settings.iban || "NL66 KNAB 0800 1498 74";
  const voetnoot =
    settings.factuur_voetnoot || `Bij vragen: ${bedrijfEmail} · ${bedrijfTel}`;

  const fmtEur = (n: number) =>
    n.toLocaleString("nl-NL", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"/>
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
        <div style="font-size:11.5px;color:#444;line-height:1.7;margin-top:4px">
          ${order.straat ? `<div>${order.straat}</div>` : ""}
          <div>${[order.postcode, order.plaats].filter(Boolean).join(" ")}</div>
        </div>
      </div>
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#888;margin-bottom:7px">Verschuldigd aan</div>
        <div style="font-weight:600;margin-bottom:3px">${bedrijfNaam}</div>
        <div style="font-size:11.5px;color:#444;line-height:1.75">${bedrijfAdres}<br>${bedrijfPc} ${bedrijfPlaats}</div>
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
          <td style="padding:12px 11px;font-size:12.5px">${omschrijving}</td>
          <td style="padding:12px 11px;text-align:right;font-size:12.5px;white-space:nowrap">€ ${fmtEur(exclBTW)}</td>
        </tr>
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
}

export function printInvoice(order: Order, settings: InvoiceSettings) {
  const html = generateInvoiceHTML(order, settings);
  const w = window.open("", "_blank", "width=920,height=750");
  if (!w) {
    alert("Sta pop-ups toe om de factuur te printen");
    return;
  }
  w.document.write(html);
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 600);
}
