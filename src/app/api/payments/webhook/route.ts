import { NextRequest, NextResponse } from "next/server";

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
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
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
      // TODO: Update order.invoice_paid = true in Supabase
      console.log(`Payment ${id} confirmed as paid`);
    }

    return NextResponse.json({ received: true, status: payment.status });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
