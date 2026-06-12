"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Legger } from "@/types";

export function useLeggers(companyId?: string | null) {
  return useQuery({
    queryKey: ["leggers", companyId],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("leggers")
        .select("*")
        .order("naam", { ascending: true });
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      const { data, error } = await query;
      console.log("[useLeggers] Result:", data?.length, "rows, error:", error?.message);
      if (error) throw error;
      return (data as Legger[]) || [];
    },
  });
}

export function useCreateLegger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (legger: Partial<Legger>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leggers")
        .insert(legger)
        .select()
        .single();
      if (error) throw error;
      return data as Legger;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leggers"] });
    },
  });
}

export function useUpdateLegger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Legger>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leggers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Legger;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leggers"] });
    },
  });
}
