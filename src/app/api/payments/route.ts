import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, description, redirectUrl } = body;

    if (!amount || !description) {
      return NextResponse.json(
        { error: "Missing required fields: amount, description" },
        { status: 400 }
      );
    }

    const apiKey = process.env.MOLLIE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Mollie API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: amount.toFixed(2),
        },
        description,
        redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_BASE_URL || ""}/dashboard`,
        webhookUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/payments/webhook`,
        method: "ideal",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to create payment" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: data._links?.checkout?.href,
      paymentId: data.id,
    });
  } catch (error) {
    console.error("Payment API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
