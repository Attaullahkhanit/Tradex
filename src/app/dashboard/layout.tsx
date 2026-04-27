"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TradexLogo } from "@/components/ui/tradex-logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-zinc-100">
      {/* Desktop Sidebar */}
      <Sidebar className="hidden md:flex sticky top-0 h-screen" />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile Header */}
        <header className="flex h-16 items-center border-b border-zinc-800 bg-zinc-950 px-6 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 mr-2 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center gap-2">
            <TradexLogo className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">Tradex</span>
          </div>
        </header>

        <main className="flex-1 bg-zinc-950/50">
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mounted && (
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="w-64 border-zinc-800 bg-zinc-950">
            <div className="relative flex h-full flex-col">
              <div className="absolute right-4 top-4 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Sidebar onClose={() => setIsMobileMenuOpen(false)} className="w-full border-r-0" />
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
