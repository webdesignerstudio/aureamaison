import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPaymentReceived } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function POST(req: NextRequest) {
  try {
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
              await sendPaymentReceived({
                to: order.client_email,
                clientName: order.client_name,
                invoiceNr: order.invoice_nr || invoiceNr || id,
                amount: parseFloat(order.price) || 0,
              }).catch((e) => console.error("[Webhook] Email failed:", e));
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
