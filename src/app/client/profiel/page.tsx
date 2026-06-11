"use client";

import { ClientLayout } from "@/components/layout/client-layout";
import { useAuth } from "@/hooks/use-auth";

export default function ClientProfielPage() {
  const { user } = useAuth();

  return (
    <ClientLayout>
      <div>
        <h1 className="font-[family-name:var(--font-cormorant)] text-3xl font-semibold text-gold">
          Mijn Profiel
        </h1>
        <p className="mt-2 text-muted">Uw accountgegevens.</p>

        <div className="mt-6 rounded-xl border border-gold/10 bg-deep p-6">
          <div className="space-y-3 text-sm">
            <div><span className="text-muted">Naam:</span> <span className="text-foreground">{user?.name || "—"}</span></div>
            <div><span className="text-muted">E-mail:</span> <span className="text-foreground">{user?.email}</span></div>
            <div><span className="text-muted">Rol:</span> <span className="text-foreground capitalize">{user?.role}</span></div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
