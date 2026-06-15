const FROM_EMAIL = "Aurea Maison Floors <noreply@aureamaisonfloors.nl>";

/* ═══════════════════════════════════════════════════════════════
   CLIENT-SIDE EMAIL (from browser)
   ═══════════════════════════════════════════════════════════════ */
export async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("/api/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, subject, html }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to send email");
  }

  return data;
}

/* ═══════════════════════════════════════════════════════════════
   SERVER-SIDE EMAIL (from API routes / server components)
   ═══════════════════════════════════════════════════════════════ */
export async function sendEmailServer(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY not configured — skipping email");
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[Email] Failed:", data.message || response.statusText);
    throw new Error(data.message || "Failed to send email");
  }

  console.log(`[Email] Sent to ${to}: ${subject}`);
  return { success: true, id: data.id };
}

/* ═══════════════════════════════════════════════════════════════
   EMAIL TEMPLATES
   ═══════════════════════════════════════════════════════════════ */

function baseTemplate(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Cormorant Garamond', Georgia, serif; background: #f5f5f5; padding: 20px; margin: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .header { background: #050505; padding: 32px; text-align: center; }
    .header h1 { color: #C6A56B; margin: 0; font-size: 26px; font-weight: 300; letter-spacing: 3px; text-transform: uppercase; }
    .header p { color: rgba(198,165,107,0.5); margin: 6px 0 0; font-size: 12px; letter-spacing: 2px; }
    .content { padding: 32px; color: #333; font-size: 15px; line-height: 1.8; }
    .content p { margin: 0 0 14px; }
    .highlight { background: rgba(198,165,107,0.08); border-left: 3px solid #C6A56B; padding: 14px 18px; margin: 18px 0; }
    .amount { font-size: 32px; font-weight: 600; color: #050505; margin: 16px 0; }
    .button { display: inline-block; background: #C6A56B; color: #050505; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; font-size: 13px; }
    .button-outline { display: inline-block; background: transparent; color: #C6A56B; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; border: 1px solid #C6A56B; font-size: 13px; }
    .divider { height: 1px; background: #eee; margin: 24px 0; }
    .footer { background: #f5f5f5; padding: 24px; text-align: center; font-size: 12px; color: #888; line-height: 1.6; }
    .footer a { color: #888; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
    .status-green { background: rgba(60,184,122,0.1); color: #3CB87A; }
    .status-blue { background: rgba(74,158,232,0.1); color: #4A9EE8; }
    .status-gold { background: rgba(198,165,107,0.1); color: #C6A56B; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Aurea Maison</h1>
      <p>Floors & Interiors</p>
    </div>
    <div class="content">${content}</div>
    <div class="footer">
      <strong>Aurea Maison Floors</strong><br>
      Zuidwijkstraat 28, 2729 KD Zoetermeer<br>
      <a href="mailto:info@aureamaisonfloors.nl">info@aureamaisonfloors.nl</a> · 06 28 27 35 70<br><br>
      <em>Ultra Premium Flooring</em>
    </div>
  </div>
</body>
</html>`;
}

export function invoiceEmailTemplate(
  clientName: string,
  invoiceNr: string,
  amount: number,
  paymentLink?: string
): string {
  return baseTemplate(
    "Factuur",
    `
      <p>Beste ${clientName},</p>
      <p>Hierbij ontvangt u factuur <strong>${invoiceNr}</strong>.</p>
      <div class="amount">€ ${amount.toFixed(2)}</div>
      ${paymentLink ? `<p><a href="${paymentLink}" class="button">Direct betalen via iDEAL</a></p>` : ""}
      <div class="divider"></div>
      <p style="font-size: 13px; color: #666;">Bij vragen kunt u contact opnemen via <a href="mailto:info@aureamaisonfloors.nl">info@aureamaisonfloors.nl</a> of bel 06 28 27 35 70.</p>
    `
  );
}

export function offerteEmailTemplate(
  clientName: string,
  offerteId: string,
  baseUrl?: string
): string {
  const link = baseUrl ? `${baseUrl}/offerte/${offerteId}` : "#";
  return baseTemplate(
    "Offerte",
    `
      <p>Beste ${clientName},</p>
      <p>Hartelijk dank voor uw aanvraag. Hierbij ontvangt u onze offerte.</p>
      <div class="highlight">
        <strong>Offertenummer:</strong> ${offerteId}<br>
        <strong>Geldigheid:</strong> 30 dagen
      </div>
      <p><a href="${link}" class="button">Offerte bekijken & accepteren</a></p>
      <p style="font-size: 13px; color: #666;">Deze offerte is 30 dagen geldig. Na acceptatie nemen wij contact op voor een afspraak.</p>
    `
  );
}

export function orderConfirmationEmailTemplate(
  clientName: string,
  orderId: string,
  vloerType: string,
  oppervlakte: number | null,
  baseUrl?: string
): string {
  return baseTemplate(
    "Opdracht Bevestiging",
    `
      <p>Beste ${clientName},</p>
      <p>Hartelijk dank voor uw opdracht! Wij gaan direct voor u aan de slag.</p>
      <div class="highlight">
        <strong>Opdrachtnummer:</strong> ${orderId}<br>
        <strong>Vloertype:</strong> ${vloerType}${oppervlakte ? ` — ${oppervlakte} m²` : ""}
      </div>
      <p>U kunt de status van uw opdracht volgen via uw persoonlijke portaal:</p>
      <p><a href="${baseUrl || "#"}/login" class="button">Mijn Portaal</a></p>
      <div class="divider"></div>
      <p style="font-size: 13px; color: #666;">Wij nemen binnen 24 uur contact met u op om de details te bespreken.</p>
    `
  );
}

export function statusUpdateEmailTemplate(
  clientName: string,
  orderId: string,
  status: string,
  vloerType: string
): string {
  const statusColors: Record<string, string> = {
    "in behandeling": "status-blue",
    offerte_verstuurd: "status-gold",
    gepland: "status-gold",
    bezig: "status-blue",
    afgerond: "status-green",
  };
  const badgeClass = statusColors[status.replace(/\s/g, "_")] || "status-gold";

  return baseTemplate(
    "Status Update",
    `
      <p>Beste ${clientName},</p>
      <p>Er is een update voor uw opdracht <strong>${orderId}</strong> (${vloerType}):</p>
      <div class="highlight" style="display: flex; align-items: center; gap: 12px;">
        <span class="status-badge ${badgeClass}">${status}</span>
      </div>
      <p>Bekijk de volledige details in uw portaal:</p>
      <p><a href="#" class="button-outline">Status bekijken</a></p>
      <div class="divider"></div>
      <p style="font-size: 13px; color: #666;">Heeft u vragen? Wij staan voor u klaar.</p>
    `
  );
}

export function leggerAssignedEmailTemplate(
  clientName: string,
  leggerNaam: string,
  orderId: string,
  datum?: string
): string {
  return baseTemplate(
    "Vloerlegger Toegewezen",
    `
      <p>Beste ${clientName},</p>
      <p>Goeed nieuws! Er is een vloerlegger toegewezen aan uw opdracht <strong>${orderId}</strong>.</p>
      <div class="highlight">
        <strong>Vloerlegger:</strong> ${leggerNaam}${datum ? `<br><strong>Gepland op:</strong> ${datum}` : ""}
      </div>
      <p>De vloerlegger neemt contact met u op voor de exacte afspraak.</p>
      <div class="divider"></div>
      <p style="font-size: 13px; color: #666;">Bekijk alle details in uw <a href="#">portaal</a>.</p>
    `
  );
}

export function showroomConfirmationEmailTemplate(
  naam: string,
  datum: string,
  tijd: string
): string {
  return baseTemplate(
    "Showroom Aan Huis Bevestigd",
    `
      <p>Beste ${naam},</p>
      <p>Uw showroom aan huis is bevestigd! Onze adviseur brengt meer dan 20 stalen mee.</p>
      <div class="highlight">
        <strong>Datum:</strong> ${datum}<br>
        <strong>Tijd:</strong> ${tijd}
      </div>
      <p>We kijken er naar uit u te ontmoeten.</p>
      <div class="divider"></div>
      <p style="font-size: 13px; color: #666;">Bij wijzigingen kunt u contact opnemen via <a href="mailto:info@aureamaisonfloors.nl">info@aureamaisonfloors.nl</a>.</p>
    `
  );
}

export function paymentReceivedEmailTemplate(
  clientName: string,
  invoiceNr: string,
  amount: number
): string {
  return baseTemplate(
    "Betaling Ontvangen",
    `
      <p>Beste ${clientName},</p>
      <p>Wij hebben uw betaling ontvangen. Hartelijk dank!</p>
      <div class="highlight">
        <strong>Factuur:</strong> ${invoiceNr}<br>
        <strong>Bedrag:</strong> € ${amount.toFixed(2)}
      </div>
      <p>Uw opdracht wordt nu definitief ingepland.</p>
      <div class="divider"></div>
      <p style="font-size: 13px; color: #666;">Een bevestigingsmail volgt zodra de planning is afgerond.</p>
    `
  );
}

/* ═══════════════════════════════════════════════════════════════
   EMAIL TRIGGER FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

export async function sendOrderConfirmation(params: {
  to: string;
  clientName: string;
  orderId: string;
  vloerType: string;
  oppervlakte: number | null;
  baseUrl?: string;
}) {
  const { to, clientName, orderId, vloerType, oppervlakte, baseUrl } = params;
  return sendEmailServer(
    to,
    "Uw opdracht is ontvangen — Aurea Maison Floors",
    orderConfirmationEmailTemplate(clientName, orderId, vloerType, oppervlakte, baseUrl)
  );
}

export async function sendStatusUpdate(params: {
  to: string;
  clientName: string;
  orderId: string;
  status: string;
  vloerType: string;
}) {
  const { to, clientName, orderId, status, vloerType } = params;
  return sendEmailServer(
    to,
    `Status update: ${status} — Aurea Maison Floors`,
    statusUpdateEmailTemplate(clientName, orderId, status, vloerType)
  );
}

export async function sendLeggerAssigned(params: {
  to: string;
  clientName: string;
  leggerNaam: string;
  orderId: string;
  datum?: string;
}) {
  const { to, clientName, leggerNaam, orderId, datum } = params;
  return sendEmailServer(
    to,
    "Vloerlegger toegewezen — Aurea Maison Floors",
    leggerAssignedEmailTemplate(clientName, leggerNaam, orderId, datum)
  );
}

export async function sendInvoice(params: {
  to: string;
  clientName: string;
  invoiceNr: string;
  amount: number;
  paymentLink?: string;
}) {
  const { to, clientName, invoiceNr, amount, paymentLink } = params;
  return sendEmailServer(
    to,
    `Factuur ${invoiceNr} — Aurea Maison Floors`,
    invoiceEmailTemplate(clientName, invoiceNr, amount, paymentLink)
  );
}

export async function sendPaymentReceived(params: {
  to: string;
  clientName: string;
  invoiceNr: string;
  amount: number;
}) {
  const { to, clientName, invoiceNr, amount } = params;
  return sendEmailServer(
    to,
    "Betaling ontvangen — Aurea Maison Floors",
    paymentReceivedEmailTemplate(clientName, invoiceNr, amount)
  );
}

export async function sendShowroomConfirmation(params: {
  to: string;
  naam: string;
  datum: string;
  tijd: string;
}) {
  const { to, naam, datum, tijd } = params;
  return sendEmailServer(
    to,
    "Showroom aan huis bevestigd — Aurea Maison Floors",
    showroomConfirmationEmailTemplate(naam, datum, tijd)
  );
}
