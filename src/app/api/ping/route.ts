import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    env: {
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅" : "❌",
      service_key: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅" : "❌",
      resend: process.env.RESEND_API_KEY ? "✅" : "❌",
      mollie: process.env.MOLLIE_API_KEY ? "✅" : "❌",
    },
  });
}
