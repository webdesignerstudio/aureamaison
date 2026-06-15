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
