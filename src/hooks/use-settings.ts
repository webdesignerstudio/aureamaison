"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Settings } from "@/types";

export function useSettings(companyId?: string | null) {
  return useQuery({
    queryKey: ["settings", companyId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .eq("company_id", companyId || "")
        .maybeSingle();
      if (error) throw error;
      return (data as Settings) || null;
    },
    enabled: !!companyId,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Settings>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("settings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Settings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}
