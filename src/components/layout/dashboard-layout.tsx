"use client";

import { Navbar } from "./navbar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

const NAV_ITEMS: Record<string, { href: string; label: string }[]> = {
  owner: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/offertes", label: "Offertes" },
    { href: "/dashboard/leggers", label: "Leggers" },
    { href: "/dashboard/klanten", label: "Klanten" },
    { href: "/dashboard/planning", label: "Planning" },
    { href: "/dashboard/financieel", label: "Financieel" },
    { href: "/dashboard/calculator", label: "Calculator" },
    { href: "/dashboard/settings", label: "Instellingen" },
  ],
  keyuser: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/offertes", label: "Offertes" },
    { href: "/dashboard/klanten", label: "Klanten" },
  ],
  office: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/offertes", label: "Offertes" },
  ],
  legger: [
    { href: "/legger", label: "Mijn Klussen" },
  ],
  client: [
    { href: "/client", label: "Mijn Account" },
  ],
  superadmin: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/settings", label: "Instellingen" },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, error, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
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
          <p className="text-sm text-red-400">
            Er is een fout opgetreden bij het laden van uw sessie. Probeer de pagina te vernieuwen.
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const navItems = NAV_ITEMS[user.role] || NAV_ITEMS.client;

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        items={navItems}
        userName={user.name || user.email}
        userRole={user.role}
        onLogout={signOut}
      />
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
