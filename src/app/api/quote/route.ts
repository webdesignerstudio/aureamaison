import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function sendEmailViaResend(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Quote] RESEND_API_KEY not configured — skipping email");
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Aurea Maison Floors <noreply@aureamaisonfloors.nl>",
      to,
      subject,
      html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("[Quote] Email failed:", data.message || response.statusText);
    throw new Error(data.message || "Failed to send email");
  }

  return { success: true, id: data.id };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      client_name,
      client_email,
      straat,
      postcode,
      plaats,
      vloer_type,
      oppervlakte,
      budget,
      timing,
      notes,
      company_id,
    } = body;

    if (!client_name || !client_email) {
      return NextResponse.json(
        { error: "Missing required fields: client_name, client_email" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // Insert order with service role (bypasses RLS)
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        client_name,
        client_email,
        straat: straat || "",
        postcode: postcode || "",
        plaats: plaats || "",
        vloer_type: vloer_type || "",
        oppervlakte: Number(oppervlakte) || 0,
        budget: Number(budget) || 0,
        timing: timing || "",
        status: "ingediend",
        notes: notes || "",
        company_id: company_id || "11111111-1111-1111-1111-111111111111",
      })
      .select()
      .single();

    if (error) {
      console.error("[Quote] Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    // Send notification email to Aurea
    await sendEmailViaResend(
      "info@aureamaisonfloors.nl",
      `Nieuwe offerte aanvraag — ${client_name} — ${vloer_type || "Nader te bepalen"}`,
      `<p><strong>Nieuwe offerte aanvraag</strong></p>
      <p>Naam: ${client_name}<br>Email: ${client_email}<br>Vloertype: ${vloer_type || "—"}<br>Oppervlakte: ${oppervlakte || "—"}m²<br>Budget: €${Number(budget || 0).toLocaleString("nl-NL")}<br>Timing: ${timing || "—"}<br>Postcode: ${postcode || "—"}</p>`
    ).catch((e: Error) => console.error("[Quote] Email error:", e.message));

    // Send confirmation email to client
    if (client_email && client_email.includes("@")) {
      await sendEmailViaResend(
        client_email,
        "Uw offerte aanvraag is ontvangen — Aurea Maison Floors",
        `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8">
<style>body{font-family:Georgia,serif;background:#f5f5f5;padding:20px;margin:0}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden}.header{background:#050505;padding:32px;text-align:center}.header h1{color:#C6A56B;margin:0;font-size:26px;font-weight:300;letter-spacing:3px;text-transform:uppercase}.content{padding:32px;color:#333;font-size:15px;line-height:1.8}.highlight{background:rgba(198,165,107,.08);border-left:3px solid #C6A56B;padding:14px 18px;margin:18px 0}.footer{background:#f5f5f5;padding:24px;text-align:center;font-size:12px;color:#888}</style>
</head>
<body>
<div class="container">
  <div class="header"><h1>Aurea Maison</h1></div>
  <div class="content">
    <p>Beste ${client_name},</p>
    <p>Hartelijk dank voor uw offerte aanvraag. Wij hebben deze in goede orde ontvangen.</p>
    <div class="highlight">
      <strong>Vloertype:</strong> ${vloer_type || "Nader te bepalen"}<br>
      <strong>Oppervlakte:</strong> ${oppervlakte || "—"} m²<br>
      <strong>Budget:</strong> €${Number(budget || 0).toLocaleString("nl-NL")}
    </div>
    <p>Ons team neemt binnen <strong>24 uur</strong> contact met u op voor een persoonlijk gesprek.</p>
    <p>Vragen? Mail ons op <a href="mailto:info@aureamaisonfloors.nl">info@aureamaisonfloors.nl</a> of bel <a href="tel:0628273570">06 28 27 35 70</a>.</p>
  </div>
  <div class="footer">
    <strong>Aurea Maison Floors</strong><br>Zuidwijkstraat 28, 2729 KD Zoetermeer<br><em>Ultra Premium Flooring</em>
  </div>
</div>
</body>
</html>`
      ).catch((e: Error) => console.error("[Quote] Client email error:", e.message));
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("[Quote] API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
