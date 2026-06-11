"use client";

import { Navbar } from "./navbar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

const CLIENT_NAV = [
  { href: "/client", label: "Mijn Account" },
  { href: "/client/opdracht", label: "Nieuwe Opdracht" },
  { href: "/client/profiel", label: "Profiel" },
];

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

  return (
    <div className="min-h-screen bg-background">
      <Navbar items={CLIENT_NAV} userName={user.name || user.email} userRole={user.role} onLogout={signOut} />
      <main className="pt-16">
        <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
