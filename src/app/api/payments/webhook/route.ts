import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

async function sendPaymentEmail(to: string, clientName: string, invoiceNr: string, amount: number) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Aurea Maison Floors <noreply@aureamaisonfloors.nl>",
      to,
      subject: "Betaling ontvangen — Aurea Maison Floors",
      html: `<!DOCTYPE html><html lang="nl"><head><meta charset="UTF-8"><style>body{font-family:Georgia,serif;background:#f5f5f5;padding:20px;margin:0}.container{max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden}.header{background:#050505;padding:32px;text-align:center}.header h1{color:#C6A56B;margin:0;font-size:26px;font-weight:300;letter-spacing:3px;text-transform:uppercase}.content{padding:32px;color:#333;font-size:15px;line-height:1.8}.highlight{background:rgba(198,165,107,.08);border-left:3px solid #C6A56B;padding:14px 18px;margin:18px 0}.footer{background:#f5f5f5;padding:24px;text-align:center;font-size:12px;color:#888}</style></head><body><div class="container"><div class="header"><h1>Aurea Maison</h1></div><div class="content"><p>Beste ${clientName},</p><p>Wij hebben uw betaling ontvangen. Hartelijk dank!</p><div class="highlight"><strong>Factuur:</strong> ${invoiceNr}<br><strong>Bedrag:</strong> € ${amount.toFixed(2)}</div><p>Uw opdracht wordt nu definitief ingepland.</p></div><div class="footer"><strong>Aurea Maison Floors</strong><br>Zuidwijkstraat 28, 2729 KD Zoetermeer</div></div></body></html>`,
    }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.formData();
    const id = body.get("id") as string;

    if (!id) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    }

    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Mollie API key not configured" },
        { status: 500 }
      );
    }

    // Verify payment status with Mollie
    const response = await fetch(`https://api.mollie.com/v2/payments/${id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const payment = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: payment.detail || "Failed to verify payment" },
        { status: response.status }
      );
    }

    // Update order in database based on payment status
    if (payment.status === "paid") {
      console.log(`[Webhook] Payment ${id} confirmed as paid`);

      // Find order by payment description or metadata
      const orderId = payment.metadata?.order_id;
      const invoiceNr = payment.metadata?.invoice_nr;

      if (orderId) {
        // Update order as paid
        const { data: order, error: fetchErr } = await supabase
          .from("orders")
          .select("id, client_name, client_email, invoice_nr, price")
          .eq("id", orderId)
          .single();

        if (fetchErr || !order) {
          console.warn("[Webhook] Order not found:", orderId);
        } else {
          const { error: updateErr } = await supabase
            .from("orders")
            .update({
              invoice_paid: true,
              invoice_paid_at: new Date().toISOString(),
              status: "afgerond",
            })
            .eq("id", orderId);

          if (updateErr) {
            console.error("[Webhook] Failed to update order:", updateErr);
          } else {
            console.log(`[Webhook] Order ${orderId} marked as paid`);

            // Send confirmation email
            if (order.client_email) {
              await sendPaymentEmail(
                order.client_email,
                order.client_name,
                order.invoice_nr || invoiceNr || id,
                parseFloat(String(order.price)) || 0
              ).catch((e: Error) => console.error("[Webhook] Email failed:", e.message));
            }
          }
        }
      } else {
        console.warn("[Webhook] No order_id in payment metadata");
      }
    }

    return NextResponse.json({ received: true, status: payment.status });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
