import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && sessionData?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", sessionData.user.id)
        .maybeSingle();

      if (!profile) {
        await supabase.from("profiles").insert({
          id: sessionData.user.id,
          email: sessionData.user.email || "",
          name: sessionData.user.email?.split("@")[0] || "",
          role: "owner",
          company_id: "11111111-1111-1111-1111-111111111111",
        });
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
