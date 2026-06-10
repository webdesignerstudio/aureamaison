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

    const getUser = async () => {
      try {
        setError(null);
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          let profile = null;
          let profileError = null;

          // Retry up to 3 times with delay for RLS propagation
          for (let i = 0; i < 3; i++) {
            const result = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();
            profile = result.data;
            profileError = result.error;

            if (profile) break;
            if (i < 2) {
              console.warn(`[useAuth] No profile found, retry ${i + 1}/3...`);
              await new Promise((r) => setTimeout(r, 500));
            }
          }

          if (profileError) {
            console.error("[useAuth] Profile fetch error:", profileError);
            setError(new Error(profileError.message));
          } else if (profile) {
            console.log("[useAuth] Profile loaded — role:", (profile as Profile).role);
            setUser(profile as Profile);
          } else {
            console.warn("[useAuth] No profile found for user after retries:", session.user.id);
          }
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
      async (_event: string, session: { user: { id: string } } | null) => {
        if (session?.user) {
          let profile = null;
          for (let i = 0; i < 3; i++) {
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();
            profile = data;
            if (profile) break;
            if (i < 2) await new Promise((r) => setTimeout(r, 500));
          }
          if (profile) {
            setUser(profile as Profile);
          } else {
            setUser(null);
          }
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
