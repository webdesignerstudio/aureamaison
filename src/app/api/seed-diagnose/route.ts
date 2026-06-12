import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET() {
  const supabase = getSupabase();
  const results: Record<string, any> = {};

  for (const table of ["profiles", "orders", "leggers", "offertes", "showroom_aanvragen", "companies"]) {
    const { data, error } = await supabase.from(table).select("*", { count: "exact", head: true });
    results[table] = {
      count: data?.length ?? "unknown",
      error: error?.message || null,
    };
  }

  // Check auth users
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  results["auth_users"] = {
    count: authData?.users?.length || 0,
    sample: authData?.users?.slice(0, 3).map((u: any) => ({
      email: u.email,
      role: u.user_metadata?.role,
      company_id: u.user_metadata?.company_id,
    })),
    error: authErr?.message || null,
  };

  // Check company
  const { data: company } = await supabase.from("companies").select("*").eq("id", "11111111-1111-1111-1111-111111111111").single();
  results["seed_company"] = company ? { id: company.id, naam: company.naam } : null;

  return NextResponse.json({ env: "ok", results });
}
