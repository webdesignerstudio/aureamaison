"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Legger } from "@/types";

export function useLeggers() {
  return useQuery({
    queryKey: ["leggers"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("leggers")
        .select("*")
        .order("naam", { ascending: true });
      if (error) throw error;
      return data as Legger[];
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
