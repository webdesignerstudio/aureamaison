"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Offerte } from "@/types";

export function useOffertes(companyId?: string | null) {
  return useQuery({
    queryKey: ["offertes", companyId],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("offertes")
        .select("*")
        .order("created_at", { ascending: false });
      if (companyId) {
        query = query.eq("company_id", companyId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return (data as Offerte[]) || [];
    },
    enabled: !!companyId,
  });
}

export function useCreateOfferte() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (offerte: Partial<Offerte>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("offertes")
        .insert(offerte)
        .select()
        .single();
      if (error) throw error;
      return data as Offerte;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offertes"] });
    },
  });
}

export function useUpdateOfferte() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Offerte>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("offertes")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Offerte;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offertes"] });
    },
  });
}
