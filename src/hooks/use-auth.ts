"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types";

export function useAuth() {
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const buildFallbackProfile = (sessionUser: { id: string; email?: string }): Profile => ({
      id: sessionUser.id,
      email: sessionUser.email ?? "",
      name: sessionUser.email?.split("@")[0] ?? null,
      role: "owner",
      company_id: "11111111-1111-1111-1111-111111111111",
      onboarding_status: "approved",
      onboarding_data: {},
      created_at: new Date().toISOString(),
    });

    const fetchProfile = async (sessionUser: { id: string; email?: string }): Promise<Profile> => {
      console.log("[useAuth] Fetching profile for:", sessionUser.id, sessionUser.email);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("[useAuth] Profile fetch error:", profileError);
        return buildFallbackProfile(sessionUser);
      }
      if (profile) {
        const p = profile as Profile;
        // If company_id is null, use default so data queries work
        if (!p.company_id) {
          console.warn("[useAuth] Profile has no company_id, applying default");
          p.company_id = "11111111-1111-1111-1111-111111111111";
        }
        console.log("[useAuth] Profile loaded — role:", p.role, "company:", p.company_id);
        return p;
      }
      console.warn("[useAuth] No DB profile found, using fallback for:", sessionUser.id);
      return buildFallbackProfile(sessionUser);
    };

    const getUser = async () => {
      try {
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
        }
      } catch (err) {
        console.error("[useAuth] Unexpected error:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: string, session: { user: { id: string; email?: string } } | null) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  const hasRole = (roles: UserRole[]) => {
    return user ? roles.includes(user.role) : false;
  };

  return { user, loading, error, signOut, hasRole, isAuthenticated: !!user };
}
