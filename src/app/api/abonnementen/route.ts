import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function GET(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("company_id");

    if (!companyId) {
      return NextResponse.json(
        { error: "company_id required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("abonnementen")
      .select("*")
      .eq("company_id", companyId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("Abonnementen GET error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase();
    const body = await req.json();
    const {
      type,
      entity_id,
      naam,
      email,
      tier,
      gekozen_tier,
      plan,
      status,
      betaal_methode,
      volgende_factuur,
      company_id,
      notities,
    } = body;

    if (!type || !entity_id || !naam || !company_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("abonnementen")
      .insert({
        type,
        entity_id,
        naam,
        email,
        tier: tier || 1,
        gekozen_tier: gekozen_tier || 1,
        plan,
        status: status || "proefperiode",
        betaal_methode: betaal_methode || "handmatig",
        volgende_factuur,
        company_id,
        notities,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error("Abonnementen POST error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
