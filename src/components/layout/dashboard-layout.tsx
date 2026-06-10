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
    { href: "/dashboard/facturen", label: "Facturen" },
    { href: "/dashboard/settings", label: "Instellingen" },
  ],
  keyuser: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/offertes", label: "Offertes" },
  ],
  office: [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/offertes", label: "Offertes" },
  ],
  legger: [
    { href: "/legger", label: "Mijn Klussen" },
    { href: "/legger/oplevering", label: "Oplevering" },
  ],
  client: [
    { href: "/client", label: "Mijn Orders" },
    { href: "/client/offertes", label: "Offertes" },
  ],
  superadmin: [
    { href: "/admin", label: "Overview" },
    { href: "/admin/users", label: "Gebruikers" },
    { href: "/admin/orders", label: "Orders" },
  ],
};

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
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
