"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Leverancier } from "@/types";

export function useLeveranciers(companyId?: string | null) {
  return useQuery({
    queryKey: ["leveranciers", companyId],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("leveranciers")
        .select("*")
        .order("naam", { ascending: true });
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data as Leverancier[]) || [];
    },
    enabled: !!companyId,
  });
}

export function useCreateLeverancier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lev: Partial<Leverancier>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leveranciers")
        .insert(lev)
        .select()
        .single();
      if (error) throw error;
      return data as Leverancier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leveranciers"] });
    },
  });
}

export function useUpdateLeverancier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Leverancier>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leveranciers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Leverancier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leveranciers"] });
    },
  });
}

export function useDeleteLeverancier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("leveranciers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leveranciers"] });
    },
  });
}
