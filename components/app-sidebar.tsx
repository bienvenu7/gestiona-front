"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Users,
  Settings,
  Box,
  LogOut,
  UserRoundPen,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Auth } from "@/providers/AuthContext";
import { useLogout } from "@/hooks/useAuthentication";

const navItems = [
  { title: "Vue d'ensemble", href: "/dashboard", icon: LayoutDashboard },
  { title: "Produits", href: "/dashboard/products", icon: Package },
  { title: "Commandes", href: "/dashboard/orders", icon: ShoppingCart },
  { title: "Paiements", href: "/dashboard/payments", icon: CreditCard },
  { title: "Clients", href: "/dashboard/clients", icon: UserRoundPen },
  { title: "Utilisateurs", href: "/dashboard/users", icon: Users },
  { title: "Paramètres", href: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { isLogingOut, logoutFn } = useLogout();
  const pathname = usePathname();

  const { state } = Auth();
  const id = state.user?.company.id;

  const handleLogout = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.preventDefault();
    await logoutFn().then(() => (window.location.href = "/login"));
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg btn-gradient">
            <Box className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-heading font-bold tracking-tight text-foreground">
            INVENTERA
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href} shallow>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs font-medium text-muted-foreground">
            {"Connect\u00e9 en tant que"}
          </p>
          <p className="text-sm font-semibold text-foreground">
            {state.user?.name}
          </p>
          <p className="text-xs text-muted-foreground">{state.user?.role}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-2 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {state.user && isLogingOut ? "Deconnection..." : "Se déconnecter"}
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}
