"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Settings,
  LogOut,
  Users,
  Layers,
  CreditCard,
  ChartNoAxesCombined
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { TradexLogo } from "@/components/ui/tradex-logo";

const menuItems = [
  { name: "Analytics", href: "/dashboard/analytics", icon: ChartNoAxesCombined },
  { name: "Products", href: "/dashboard/products", icon: ShoppingBag },
  { name: "Categories", href: "/dashboard/categories", icon: Layers },
  { name: "Orders", href: "/dashboard/orders", icon: CreditCard },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ onClose, className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className={cn(
      "flex h-screen w-20 lg:w-64 flex-col border-r border-zinc-800 bg-zinc-950 text-zinc-100 transition-all duration-300",
      className
    )}>
      <div className="flex h-16 items-center px-6">
        <Link
          href="/dashboard/products"
          className="flex items-center gap-2"
          onClick={onClose}
        >
          <TradexLogo className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight truncate block md:hidden lg:block">Tradex</span>
        </Link>
      </div>

      <Separator className="bg-zinc-800" />

      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-start md:justify-center lg:justify-start rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              )}
              onClick={onClose}
            >
              <item.icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors mr-3 md:mr-0 lg:mr-3",
                isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-100"
              )} />
              <span className="truncate block md:hidden lg:block text-xs lg:text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <Separator className="bg-zinc-800" />

      <div className="p-4">
        <div className="flex items-center justify-start md:justify-center lg:justify-start gap-3 rounded-lg bg-zinc-900/50 p-3 ring-1 ring-zinc-800">
          <Avatar className="h-10 w-10 border border-zinc-800 shrink-0">
            <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
            <AvatarFallback className="bg-zinc-800 text-zinc-400">
              {user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 flex-col overflow-hidden text-sm flex md:hidden lg:flex">
            <span className="truncate font-medium text-zinc-100">{user?.name}</span>
            <span className="truncate text-xs text-zinc-500">{user?.email}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-zinc-500 hover:bg-zinc-800 hover:text-white shrink-0 flex md:hidden lg:flex"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
