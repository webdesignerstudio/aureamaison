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

export function invoiceEmailTemplate(
  clientName: string,
  invoiceNr: string,
  amount: number,
  paymentLink?: string
): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #050505; padding: 30px; text-align: center; }
    .header h1 { color: #C6A56B; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .amount { font-size: 32px; font-weight: bold; color: #050505; margin: 20px 0; }
    .button { display: inline-block; background: #C6A56B; color: #050505; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Aurea Maison Floors</h1>
    </div>
    <div class="content">
      <p>Beste ${clientName},</p>
      <p>Hierbij ontvangt u factuur <strong>${invoiceNr}</strong>.</p>
      <div class="amount">€ ${amount.toFixed(2)}</div>
      ${paymentLink ? `<p><a href="${paymentLink}" class="button">Direct betalen</a></p>` : ""}
      <p>Bij vragen kunt u contact opnemen via <a href="mailto:Aureamaisonfloors@gmail.com">Aureamaisonfloors@gmail.com</a>.</p>
    </div>
    <div class="footer">
      Aurea Maison Floors — Zuidwijkstraat 28, 2729 KD Zoetermeer
    </div>
  </div>
</body>
</html>
  `;
}

export function offerteEmailTemplate(
  clientName: string,
  offerteId: string
): string {
  return `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #050505; padding: 30px; text-align: center; }
    .header h1 { color: #C6A56B; margin: 0; font-size: 24px; }
    .content { padding: 30px; }
    .button { display: inline-block; background: #C6A56B; color: #050505; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Aurea Maison Floors</h1>
    </div>
    <div class="content">
      <p>Beste ${clientName},</p>
      <p>Hartelijk dank voor uw aanvraag. Hierbij ontvangt u onze offerte.</p>
      <p>Offertenummer: <strong>${offerteId}</strong></p>
      <p>U kunt de offerte bekijken en accepteren via onderstaande link:</p>
      <p><a href="#" class="button">Offerte bekijken</a></p>
      <p>Deze offerte is 30 dagen geldig.</p>
    </div>
    <div class="footer">
      Aurea Maison Floors — Zuidwijkstraat 28, 2729 KD Zoetermeer
    </div>
  </div>
</body>
</html>
  `;
}
