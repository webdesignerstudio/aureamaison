"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { SidebarShell, type NavCat } from "./sidebar-shell";
import { SettingsGear } from "@/components/modules/settings-gear";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/client/login");
    }
    if (!loading && user && user.role !== "client") {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
          <p className="text-sm text-red-400">Er is een fout opgetreden bij het laden van uw sessie.</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "client") {
    return null;
  }

  const cats: NavCat[] = [
    {
      id: "portaal", icon: "📋", label: "Mijn Portaal",
      tabs: [
        { href: "/client", icon: "📋", label: "Opdrachten" },
        { href: "/client/opdracht", icon: "➕", label: "Nieuwe Opdracht" },
        { href: "/client/facturen", icon: "🧾", label: "Facturen" },
        { href: "/client/profiel", icon: "👤", label: "Profiel" },
      ],
    },
  ];

  return (
    <SidebarShell
      cats={cats}
      flat
      logoSubtitle="Particulier Portaal"
      userName={user.name || user.email}
      settingsSlot={<SettingsGear userId={user.id} email={user.email} name={user.name || ""} />}
      onLogout={signOut}
    >
      {children}
    </SidebarShell>
  );
}
