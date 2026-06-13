"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ShowroomAanvraag } from "@/types";

export type { ShowroomAanvraag };

export function useShowroomAanvragen(companyId?: string | null) {
  return useQuery({
    queryKey: ["showroom_aanvragen", companyId],
    queryFn: async () => {
      const supabase = createClient();
      let q = supabase
        .from("showroom_aanvragen")
        .select("*")
        .order("created_at", { ascending: false });
      if (companyId) q = q.eq("company_id", companyId);
      const { data, error } = await q;
      if (error) throw error;
      return (data as ShowroomAanvraag[]) || [];
    },
    enabled: !!companyId,
  });
}

export function useUpdateShowroom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<ShowroomAanvraag>) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("showroom_aanvragen")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as ShowroomAanvraag;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["showroom_aanvragen"] }); },
  });
}
