"use client";

import { AppLogo } from "@/components/AppLogo";
import { UserNav } from "@/components/UserNav";
import { TimerIndicator } from "@/components/pomodoro/TimerIndicator";
import { TimerProvider } from "@/contexts/TimerContext";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
    SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Columns3,
  MessageCircle,
  Timer,
  Settings,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel" },
  { href: "/board", icon: Columns3, label: "Tablero" },
  { href: "/timer", icon: Timer, label: "Temporizador" },
  { href: "/assistant", icon: MessageCircle, label: "Asistente" },
  { href: "/settings", icon: Settings, label: "Ajustes" },
];

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user;
  const router = useRouter();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Let middleware handle redirect
  }

  return (
    <TimerProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="px-4 py-5">
            <AppLogo />
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label }}
                    className="h-10 text-[0.9375rem] data-[active=true]:font-semibold data-[active=true]:[&>svg]:text-primary"
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-2xl font-bold md:text-3xl">
                {navItems.find((item) => item.href === pathname)?.label}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <TimerIndicator />
              <UserNav />
            </div>
          </header>
          <main className="flex-1 overflow-auto px-4 pb-8 pt-2 sm:px-6 lg:px-8">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </TimerProvider>
  );
}
